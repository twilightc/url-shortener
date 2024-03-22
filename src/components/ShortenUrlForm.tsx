'use client';

import { useState } from 'react';
import ProduceResult from './ProduceResult/ProduceResult';
import Loading from './Loading';
import { createShortUrl } from '../api/client';

export default function ShortenUrlForm() {
  const [originUrl, setOriginUrl] = useState('');

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [errorMessage, setErrorMessage] = useState('');

  const [shortUrlInfo, setShortUrlInfo] = useState<{
    urlCode?: string;
    ogInfo?: {
      title: string;
      siteName: string;
      image: string;
      description: string;
    };
  } | null>(null);

  const checkIsValidUrl = () => {
    if (originUrl === '') {
      setErrorMessage('url cannot be blank');
      return false;
    }

    const urlPattern =
      /(?:https?):\/\/(\w+:?\w*)?(\S+)(:\d+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;

    if (!urlPattern.test(originUrl)) {
      setErrorMessage('url format incorrect');
      return false;
    }

    return true;
  };

  // check whether url is avaliable indeed
  const handleShortenUrl = async () => {
    if (!checkIsValidUrl()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await createShortUrl<{
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
      }>(originUrl);

      if (result.isSuccess) {
        const data = result.data;

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
      } else {
        setErrorMessage(result.message);
      }
    } catch (error) {
      console.log(error);

      setErrorMessage('unexpected error occured.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-[30px] max-w-[600px] w-[100%]">
      <form
        className="grid gap-[10px]"
        onSubmit={(e) => {
          e.preventDefault();
          setErrorMessage('');
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
      {errorMessage !== '' && (
        <div className="text-[20px] text-[#ff0000]">{errorMessage}</div>
      )}
      {shortUrlInfo && (
        <ProduceResult
          urlCode={shortUrlInfo.urlCode}
          ogInfo={shortUrlInfo.ogInfo}
        ></ProduceResult>
      )}
    </div>
  );
}
