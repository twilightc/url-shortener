import { SuccessResponse, ErrorResponse } from '@/src/models';

export async function createShortUrl<T>(
  originUrl: string
): Promise<SuccessResponse<T> | ErrorResponse> {
  const res = await fetch('api/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      originUrl,
    }),
  });

  if (!res.ok && res.status !== 200) {
    let { err, message } = (await res.json()) as {
      err: unknown;
      message: string;
    };

    return {
      isSuccess: false,
      message,
      data: err,
    };
  }

  return {
    isSuccess: true,
    message: '',
    data: (await res.json()) as T,
  };
}