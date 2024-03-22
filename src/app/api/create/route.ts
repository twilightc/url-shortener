import { isWebUri } from 'valid-url';
import { NextRequest } from 'next/server';
import { urlBannedList } from '@/src/utils';
import { checkIfCanGenrateNewUrl, createShortUrl } from '@/src/services/createService';

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
            'you can only produce 3 short url per day, please contact author for more info',
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

  try {
    const result = await createShortUrl(url,ipAddress,host);

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
