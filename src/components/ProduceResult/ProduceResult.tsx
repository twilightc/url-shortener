'use client';

import { useRef, useState } from 'react';
import { apiUrl } from '../../utils';
import './ProduceResult.scss';
import { SwitchTransition, CSSTransition } from 'react-transition-group';

export default function ProduceResult({ urlCode }: { urlCode: string }) {
  const [isCopied, setIsCopied] = useState(false);
  const shortUrlRef = useRef<HTMLInputElement>(null);

  const handleCopyToClickBoard = () => {
    if (shortUrlRef.current) {
      navigator.clipboard.writeText(shortUrlRef.current.value);
      setIsCopied(true);

      setTimeout(() => {
        setIsCopied(false);
      }, 5000);
    }
  };

  return (
    <div className="grid gap-[5px]">
      <div>Your short url is:</div>
      <input
        ref={shortUrlRef}
        className="w-full h-[40px] rounded-[8px] px-[8px]"
        type="text"
        value={`${apiUrl}/` + urlCode}
        readOnly
      />
      <div className="flex items-center justify-start gap-[10px]">
        <a
          className="p-[5px] bg-[#ffffff] border-[1px] border-solid border-[#087da8] text-[#087da8] rounded-[8px]"
          href={`${apiUrl}/` + urlCode}
          target="_blank"
        >
          Visit it
        </a>
        <button
          className="h-full w-[200px] bg-[#1f8244] text-[#fff] rounded-[8px]"
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
