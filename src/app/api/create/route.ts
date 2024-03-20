import dayjs from 'dayjs';
import { generateShortUrl, prisma } from '@/lib';
import { isWebUri } from 'valid-url';
import { NextRequest } from 'next/server';
import run from 'open-graph-scraper';

export const POST = async (req: NextRequest) => {
  if (req.method !== 'POST') {
    return Response.json('only permit POST method', { status: 405 });
  }

  const { originUrl: url } = (await req.json()) as { originUrl: string };

  if (!isWebUri(url)) {
    return Response.json('incorrect format', { status: 400 });
  }

  const host = req.headers.get('host') ?? '';
  const { shortUrlCode, fullShortenUrl } = generateShortUrl(host);

  // if url has existed then return it, or create a new one
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
            tagId: existedUrl.id,
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

      const newShortUrl = await tx.shortenedUrl.create({
        data: {
          shortenedUrl: fullShortenUrl,
          urlCode: shortUrlCode,
          originalUrl: url,
          createDate: new Date(),
          expireDate: dayjs(new Date()).add(1, 'd').toDate(),
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
            shortenedUrl: {
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
  } catch (error) {
    return Response.json(
      'error occured during transaction, operation has been rolled back',
      { status: 500 }
    );
  }
};
