'use server';

import { prisma } from '@/lib';
import { redirect } from 'next/dist/client/components/navigation';
import { kv } from '@vercel/kv';
import { Metadata } from 'next';

const getUrlInfoFromKv = async (code: string) =>
  kv.get<{
    originalUrl: string;
    id: string;
  }>(`${code}`);

const getOriginalUrl = async (shortenedCode: string) =>
  prisma.shortenedUrl.findFirst({
    where: {
      urlCode: shortenedCode,
    },
  });

const findThenSaveOgInfoToKv = async (
  shortenedCode: string,
  result: {
    originalUrl: string;
    id: string;
  }
) => {
  const urlOgInfo = await prisma.openGraphTag.findUnique({
    where: {
      tagId: result?.id ?? '',
    },
  });

  // due to distributed serverless service, kv doesn't provide watch method to guarantee atomicity
  await kv
    .multi()
    .set(
      `${shortenedCode}`,
      {
        originalUrl: result.originalUrl,
        id: result.id,
      },
      {
        ex: 3600 * 6,
      }
    )
    .set(
      `${result.id}`,
      {
        ...urlOgInfo,
      },
      {
        ex: 3600 * 6,
      }
    )
    .exec();
};

export async function generateMetadata({
  params,
}: {
  params: { shortenedCode: string };
}): Promise<Metadata> {
  const shortenedCode = params.shortenedCode ?? '';

  const urlFromKv = await getUrlInfoFromKv(shortenedCode);

  if (!urlFromKv || urlFromKv?.originalUrl === '') {
    const originalUrl = await getOriginalUrl(shortenedCode);

    const urlOgInfo = await prisma.openGraphTag.findUnique({
      where: {
        tagId: originalUrl?.id ?? '',
      },
    });

    return {
      title: urlOgInfo?.title,
      description: urlOgInfo?.description,
      openGraph: {
        url: urlOgInfo?.url,
        title: urlOgInfo?.title,
        siteName: urlOgInfo?.siteName,
        images: [{ url: urlOgInfo?.image ?? '' }],
        description: urlOgInfo?.description,
      },
    };
  } else {
    const ogFromKv = await kv.get<{
      id: string;
      url: string;
      title: string;
      description: string;
      image: string;
      siteName: string;
      tagId: string;
    }>(urlFromKv.id);

    return {
      title: ogFromKv?.title,
      description: ogFromKv?.description,
      openGraph: {
        url: ogFromKv?.url,
        title: ogFromKv?.title,
        siteName: ogFromKv?.siteName,
        images: [{ url: ogFromKv?.image ?? '' }],
        description: ogFromKv?.description,
      },
    };
  }
}

export default async function ShortUrl({
  params,
}: {
  params: { shortenedCode: string };
}) {
  const shortenedCode = params.shortenedCode ?? '';

  const urlInfo = await getUrlInfoFromKv(shortenedCode);

  if (urlInfo && urlInfo.originalUrl !== '') {
    redirect(urlInfo?.originalUrl ?? '/');
  } else {
    const result = await getOriginalUrl(shortenedCode);

    if (result?.originalUrl) {
      try {
        findThenSaveOgInfoToKv(shortenedCode, result);
      } catch (error) {
        console.log('error occured during saving info to kv');
      }
    }

    redirect(result?.originalUrl ?? '/');
  }
}
