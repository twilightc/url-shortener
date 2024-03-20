'use client';

import { useState } from 'react';
import ProduceResult from './ProduceResult/ProduceResult';
import Loading from './Loading';

export default function UrlForm() {
  const [originUrl, setOriginUrl] = useState('');

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [urlCode, setUrlCode] = useState('');

  // check whether url is avaliable indeed
  const handleShortenUrl = async () => {
    setIsLoading(true);

    const result = await fetch('api/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        originUrl,
      }),
    });

    const data = (await result.json()) as {
      id: string;
      shortenedUrl: string;
      urlCode: string;
      originalUrl: string;
      createDate: Date;
      expireDate: Date;
      ogInfo: {
        siteName: string;
        title: string;
        image: string;
        description: string;
      };
    };

    if (result.status === 200 && data) {
      setUrlCode(data.urlCode);
    }

    setIsLoading(false);
  };

  return (
    <div className="flex flex-col gap-[30px] max-w-[500px] w-[100%]">
      <form
        className="grid gap-[10px]"
        onSubmit={(e) => {
          e.preventDefault();
          setUrlCode('');
          handleShortenUrl();
        }}
      >
        <div>
          <div className="text-[28px] mb-[20px]">Shorten Your url</div>

          <input
            className="w-full h-[40px] rounded-[8px] px-[8px]"
            type="url"
            value={originUrl}
            onChange={(e) => {
              setOriginUrl(e.target.value);
            }}
            disabled={isLoading}
          />
        </div>
        <div>
          <button
            className="w-[180px] h-[40px] bg-[#186334] rounded-[8px] p-[4px]"
            type="submit"
            disabled={isLoading}
          >
            <div className="flex items-center justify-center">
              {isLoading && (
                <div className="animate-spin rounded-full h-[20px] w-[20px] mr-[6px] border-t-2 border-b-2 border-gray-900"></div>
              )}
              <span className="text-[#fff]">
                {isLoading ? 'Processing...' : 'Shorten it'}
              </span>
            </div>
          </button>
        </div>
      </form>
      {isLoading && <Loading></Loading>}
      {urlCode && <ProduceResult urlCode={urlCode}></ProduceResult>}
    </div>
  );
}
