'use client';

import { useState } from 'react';
import ProduceResult from './ProduceResult/ProduceResult';
import Loading from './Loading';

export default function UrlForm() {
  const [originUrl, setOriginUrl] = useState('');

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [shortUrlInfo, setShortUrlInfo] = useState<{
    urlCode?: string;
    ogInfo?: {
      title: string;
      siteName: string;
      image: string;
      description: string;
    };
  } | null>(null);

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
      setShortUrlInfo({
        urlCode: data.urlCode,
        ogInfo: {
          ...data.ogInfo,
          title:
            data.ogInfo.title.length > 15
              ? data.ogInfo.title.substring(0, 14) + '...'
              : data.ogInfo.title,
          description:
            data.ogInfo.description.length > 20
              ? data.ogInfo.description.substring(0, 19) + '...'
              : data.ogInfo.description,
        },
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="flex flex-col gap-[30px] max-w-[500px] w-[100%]">
      <form
        className="grid gap-[10px]"
        onSubmit={(e) => {
          e.preventDefault();
          setShortUrlInfo(null);
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
      {shortUrlInfo && (
        <ProduceResult
          urlCode={shortUrlInfo.urlCode}
          ogInfo={shortUrlInfo.ogInfo}
        ></ProduceResult>
      )}
    </div>
  );
}
