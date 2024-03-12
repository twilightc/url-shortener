import dayjs from 'dayjs';
import { generateShortUrl, prisma } from '@/lib';
import { isWebUri } from 'valid-url';
import { NextRequest } from 'next/server';

export const POST = async (req: NextRequest) => {
  if (req.method !== 'POST') {
    return Response.json('only permit POST method', { status: 405 });
  }

  const { userId, url } = (await req.json()) as { userId: number; url: string };

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
        return existedUrl;
      }

      return await tx.shortenedUrl.create({
        data: {
          shortenedUrl: fullShortenUrl,
          urlCode: shortUrlCode,
          originalUrl: url,
          createDate: new Date(),
          expireDate: dayjs(new Date()).add(1, 'd').toDate(),
          userId,
        },
      });
    });

    return Response.json({
      ...result
    }, {
      status: 200,
    });
  } catch (error) {
    return Response.json(
      'error occured during transaction, operation has been rolled back',
      { status: 500 }
    );
  }
};
