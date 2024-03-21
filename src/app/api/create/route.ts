import dayjs from 'dayjs';
import { generateShortUrl, prisma } from '@/lib';
import { isWebUri } from 'valid-url';
import { NextRequest } from 'next/server';
import run from 'open-graph-scraper';
import { urlBannedList } from '@/src/utils';

const checkIfCanGenrateNewUrl = async (ipAddress: string) => {
  const findResult = await prisma.dataAnalytic.findUnique({
    where: {
      ip: ipAddress,
    },
  });

  if (!findResult) {
    return true;
  }

  const shortUrls1 = await prisma.shortenedUrl.findMany({
    where: {
      dataAnalyticId: findResult.id,
    },
    orderBy: {
      createDate: 'desc',
    },
  });

  const currentTime = dayjs(new Date());
  const matchedUrls = shortUrls1.filter(
    (info) => currentTime.diff(dayjs(info.createDate), 'day') < 1
  );

  return matchedUrls.length < 3;
};

export const POST = async (req: NextRequest) => {
  if (req.method !== 'POST') {
    return Response.json(
      { err: {}, message: 'only permit POST method' },
      { status: 405 }
    );
  }

  const { originUrl: url } = (await req.json()) as { originUrl: string };

  if (!isWebUri(url)) {
    return Response.json(
      { err: {}, message: 'incorrect url format' },
      { status: 400 }
    );
  }

  // another case: check if url can be visited indeed, if not, return status code 422 also
  if (urlBannedList.some((bannedUrl) => url.includes(bannedUrl))) {
    return Response.json(
      { err: {}, message: 'url domain banned' },
      { status: 422 }
    );
  }

  const ipAddress =
    req.headers.get('x-forwarded-for')?.split(',').at(0)?.trim() ?? '';

  // ONLY for development
  // should save all info about header info to prevent fake header
  // more info: https://devco.re/blog/2014/06/19/client-ip-detection/
  try {
    const checkResult = await checkIfCanGenrateNewUrl(ipAddress);

    if (!checkResult) {
      return Response.json(
        {
          err: {},
          message:
            'only can produce 3 short url per day, please contact author for more info',
        },
        { status: 429 }
      );
    }
  } catch (err) {
    return Response.json(
      {
        err: {},
        message: 'error occured during url validation',
      },
      { status: 500 }
    );
  }

  const host = req.headers.get('host') ?? '';
  const { shortUrlCode, fullShortenUrl } = generateShortUrl(host);

  try {
    const result = await prisma.$transaction(async (tx) => {
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
      // may downgrade to avoid the issue
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
            image: (rawOgData?.ogImage ?? [])[0].url,
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

    return Response.json(result, {
      status: 200,
    });
  } catch (err) {
    return Response.json(
      {
        err,
        message:
          'error occured during transaction, operation has been rolled back',
      },
      { status: 500 }
    );
  }
};
