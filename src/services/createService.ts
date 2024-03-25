import { generateShortUrl, prisma } from '@/lib';
import dayjs from 'dayjs';
import run from 'open-graph-scraper';
import { GENERATE_UPPERBOUND } from '../utils';

export const checkIfCanGenrateNewUrl = async (ipAddress: string) => {
  const findResult = await prisma.dataAnalytic.findUnique({
    where: {
      ip: ipAddress,
    },
  });

  if (!findResult) {
    return true;
  }

  const shortUrls = await prisma.shortenedUrl.findMany({
    where: {
      dataAnalyticId: findResult.id,
    },
    orderBy: {
      createDate: 'desc',
    },
  });

  const currentTime = dayjs(new Date());
  const matchedUrls = shortUrls.filter(
    (info) => currentTime.diff(dayjs(info.createDate), 'day') < 1
  );

  return matchedUrls.length < GENERATE_UPPERBOUND;
};

export const createShortUrl = async (
  url: string,
  ipAddress: string,
  host: string
) => {
  const { shortUrlCode, fullShortenUrl } = generateShortUrl(host);

  return await prisma.$transaction(async (tx) => {
    const existedUrl = await tx.shortenedUrl.findFirst({
      where: {
        originalUrl: url,
      },
    });

    if (existedUrl) {
      const existedUrlWithOgInfo = await tx.openGraphTag.findFirst({
        where: {
          shortenedUrlId: existedUrl.id,
        },
      });

      return {
        ...existedUrl,
        ogInfo: {
          url: existedUrlWithOgInfo?.url || '',
          title: existedUrlWithOgInfo?.title || '',
          siteName: existedUrlWithOgInfo?.siteName || '',
          image: existedUrlWithOgInfo?.image || '',
          description: existedUrlWithOgInfo?.description || '',
        },
      };
    }

    let dataAnalytic = await tx.dataAnalytic.findUnique({
      where: {
        ip: ipAddress,
      },
    });

    if (dataAnalytic) {
      await tx.dataAnalytic.update({
        where: {
          ip: ipAddress,
        },
        data: {
          createTimes: {
            increment: 1,
          },
        },
      });
    } else {
      dataAnalytic = await tx.dataAnalytic.create({
        data: {
          createTimes: 1,
          ip: ipAddress,
        },
      });
    }

    const newShortUrl = await tx.shortenedUrl.create({
      data: {
        shortenedUrl: fullShortenUrl,
        urlCode: shortUrlCode,
        originalUrl: url,
        createDate: new Date(),
        expireDate: dayjs(new Date()).add(1, 'd').toDate(),
        DataAnalytic: {
          connect: {
            id: dataAnalytic?.id,
          },
        },
      },
    });

    // https://github.com/jshemas/openGraphScraper/issues/215
    // may downgrade from 6.5.0 -> 6.3.2 until issue got solved
    const { result: rawOgData } = await run({
      url: newShortUrl.originalUrl,
    });

    if (rawOgData?.ogTitle) {
      const newOgData = await tx.openGraphTag.create({
        data: {
          url: rawOgData?.ogUrl ?? '',
          title: rawOgData?.ogTitle ?? '',
          siteName: rawOgData?.ogSiteName ?? '',
          description: rawOgData?.ogDescription ?? '',
          // image: (rawOgData?.ogImage ?? [])[0].url,
          image: (rawOgData?.ogImage ?? []).at(0)?.url ?? '',
          ShortenedUrl: {
            connect: {
              id: newShortUrl.id,
            },
          },
        },
      });

      return {
        ...newShortUrl,
        ogInfo: {
          url: newOgData.url,
          siteName: newOgData.siteName,
          title: newOgData.title,
          image: newOgData.image,
          description: newOgData.description,
        },
      };
    }

    return newShortUrl;
  });
};
