'use server';

import { prisma } from '@/lib';
import { redirect } from 'next/dist/client/components/navigation';
import { kv } from '@vercel/kv';

export default async function ShortUrl({
  params,
}: {
  params: { shortenedCode: string };
}) {
  const shortenedCode = params.shortenedCode ?? '';

  const result = (await kv.get(`${shortenedCode}`)) ?? '';
  if (result !== '') {
    redirect(`${result}`);
  } else {
    const getOriginalUrl = async () => {
      return await prisma.shortenedUrl.findUnique({
        where: {
          urlCode: shortenedCode,
        },
      });
    };
    const result = await getOriginalUrl();

    if (result?.originalUrl) {
      await kv.set(`${shortenedCode}`, `${result?.originalUrl}`, {
        ex: 3600 * 6,
      });
    }

    redirect(result?.originalUrl ?? '/');
  }
}
