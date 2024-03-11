import { env } from 'process';

export const apiUrl =
  env.NODE_ENV === 'production'
    ? process.env.NEXT_PUBLIC_API_URL
    : 'http://localhost:3000';
