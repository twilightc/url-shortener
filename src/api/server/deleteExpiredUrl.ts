import { prisma } from '@/lib';

export async function deleteExpiredUrls() {
  try {
    return prisma.$transaction(async (tx) => {
      const currentTime = new Date();

      const expiredUrls = await tx.shortenedUrl.findMany({
        where: {
          expireTime: {
            lt: currentTime,
          },
        },
      });

      await tx.shortenedUrl.deleteMany({
        where: {
          expireTime: {
            lt: currentTime,
          },
        },
      });

      for (const deletedUrlInfo of expiredUrls.map(
        (info) => info.dataAnalyticId
      )) {
        const analyticInfo = await tx.dataAnalytic.findUnique({
          where: {
            id: deletedUrlInfo,
          },
        });
        if (analyticInfo) {
          if (analyticInfo.createTimes === 1) {
            await tx.dataAnalytic.delete({
              where: {
                id: analyticInfo.id,
              },
            });
          } else {
            await tx.dataAnalytic.update({
              where: {
                id: analyticInfo.id,
              },
              data: {
                createTimes: {
                  decrement: 1,
                },
              },
            });
          }
        }
      }
    });
  } catch (error) {
    console.log(
      'error occured when deleting expired urls, operations have been rollbacked.'
    );
  }
}
