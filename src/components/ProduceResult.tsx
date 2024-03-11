'use client';

import { useState } from 'react';
import { apiUrl } from '../utils';

export default function ProduceResult({ urlCode }: { urlCode: string }) {
  const [isTriggerCopy, setIsTriggerCopy] = useState(false);

  return (
    <div className="grid gap-[30px]">
      Your short url is: {`${apiUrl}/`+urlCode}
      <div></div>
    </div>
  );
}
