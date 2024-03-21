'use client';

import { useRef, useState } from 'react';
import './ProduceResult.scss';
import { SwitchTransition, CSSTransition } from 'react-transition-group';
import Link from 'next/link';

export default function ProduceResult({
  urlCode,
  ogInfo,
}: {
  urlCode?: string;
  ogInfo?: {
    title: string;
    siteName: string;
    image: string;
    description: string;
  };
}) {
  const [isCopied, setIsCopied] = useState(false);
  const shortUrlRef = useRef<HTMLAnchorElement>(null);

  const handleCopyToClickBoard = () => {
    if (shortUrlRef.current) {
      navigator.clipboard.writeText(shortUrlRef.current.href);
      setIsCopied(true);

      setTimeout(() => {
        setIsCopied(false);
      }, 5000);
    }
  };

  return (
    <div className="grid gap-[5px]">
      <div>Your short url is:</div>
      <div className="w-full h-[40px] leading-[40px] rounded-[8px] px-[8px] bg-[#fff] text-[#000]">
        <Link
          ref={shortUrlRef}
          href={`${window.location.origin}/` + urlCode}
          target="_blank"
        >
          {`${window.location.origin}/` + urlCode}
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-[10px]">
        <div className="col-span-2 flex w-full gap-[10px] p-[10px] bg-white">
          <figure className="flex-1">
            <div
              className="max-w-[170px] w-full h-full mx-auto"
              style={{
                backgroundImage: `url(${ogInfo?.image})`,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
              }}
            ></div>
          </figure>

          <div className="flex-1 text-[#000]">
            <figcaption> {ogInfo?.title} </figcaption>
            <div> {ogInfo?.description} </div>
            <div className="text-[rgb(110,102,102)]">{ogInfo?.siteName}</div>
          </div>
        </div>
        <button
          className="col-span-2 h-[40px] w-[200px] bg-[#1f8244] text-[#fff] rounded-[8px]"
          onClick={handleCopyToClickBoard}
        >
          <SwitchTransition>
            <CSSTransition
              key={isCopied ? 'Copied!' : 'CopyToClipboard!'}
              addEndListener={(node, done) =>
                node.addEventListener('transitionend', done, false)
              }
              classNames="text-transition"
            >
              <span>{isCopied ? 'Copied !' : 'Copy to clipboard'}</span>
            </CSSTransition>
          </SwitchTransition>
        </button>
      </div>
    </div>
  );
}
