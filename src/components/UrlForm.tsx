'use client';

import { useEffect, useState } from 'react';
import ProduceResult from './ProduceResult';

export default function UrlForm() {
  const [originUrl, setOriginUrl] = useState('');

  const [isProduceResult, setIsShowProduceResult] = useState(false);

  const [urlCode, setUrlCode] = useState('');

  // should i check whether url indeed avaliable or not?
  // may add debounce effect/ usecallback(not so good?)
  const handleShortenUrl = async () => {
    console.log(originUrl);

    const result = await fetch('api/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 123,
        url: originUrl,
      }),
      cache: 'no-store',
    });

    const data = await result.json() as {
      shortenedUrl: string;
      urlCode: string;
      originalUrl: string;
      createDate: Date;
      expireDate: Date;
      userId: number;
    };

    if (result.status === 200 && data) {
      setIsShowProduceResult(true);
      setUrlCode(data.urlCode);
    }
  };

  return (
    <>
      <form
        className="grid gap-[30px] max-w-[300px] w-[100%]"
        onSubmit={(e) => {
          e.preventDefault();
          handleShortenUrl();
        }}
      >
        <div>
          <div className="mb-[20px]">Shorten the url</div>

          <input
            className="w-full h-[40px] mb-[20px] rounded-[8px] px-[8px]"
            type="url"
            value={originUrl}
            onChange={(e) => {
              setOriginUrl(e.target.value);
            }}
          />
        </div>
        <div>
          <div className="mb-[20px]">After Shorten</div>

          <button
            className="w-[120px] h-[40px] bg-[#186334] rounded-[8px]"
            type="submit"
          >
            Shorten it
          </button>
        </div>
      </form>
      {isProduceResult && <ProduceResult urlCode={urlCode}></ProduceResult>}
    </>
  );
}
