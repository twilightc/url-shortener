import 'server-only';
import { NextRequest } from 'next/server';
import { deleteExpiredUrls } from '@/src/api/server';

export const DELETE = async (req: NextRequest) => {
  const header = req.headers.get('authorization');
  if (header !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', {
      status: 401,
    });
  }

  try {
    await deleteExpiredUrls();

    return new Response('Operation complete', {
      status: 200,
    });
  } catch (error) {
    console.log('error occured when calling method in cron jobs');
  }
};
