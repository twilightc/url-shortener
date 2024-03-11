'use server';

import { prisma } from '@/lib';
import { redirect } from 'next/dist/client/components/navigation';
import { createClient } from 'redis';

export default async function ShortUrl({
  params,
}: {
  params: { shortenedCode: string };
}) {
  const redisClient = await createClient({ url: process.env.REDIS_URL })
    .on('error', (err) => console.log('Redis Client Error', err))
    .connect();

  const shortenedCode = params.shortenedCode ?? '';

  const result = (await redisClient.get(`${shortenedCode}`)) ?? '';
  if (result !== '') {
    redisClient.disconnect();
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
      await redisClient.set(`${shortenedCode}`, `${result?.originalUrl}`, {
        EX: 3600 * 6,
      });
    }

    redisClient.disconnect();
    redirect(result?.originalUrl ?? '/');
  }
}
