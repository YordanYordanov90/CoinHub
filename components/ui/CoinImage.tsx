'use client';

import Image, { type ImageProps } from 'next/image';
import { useMemo, useState } from 'react';

interface CoinImageProps extends Omit<ImageProps, 'src'> {
  src: string | null | undefined;
}

const FALLBACK_SRC = '/globe.svg';

export default function CoinImage({
  src,
  alt,
  className,
  loading,
  ...rest
}: CoinImageProps) {
  const normalizedSrc = useMemo(() => {
    const trimmed = src?.trim();
    return trimmed && trimmed.length > 0 ? trimmed : FALLBACK_SRC;
  }, [src]);

  const [currentSrc, setCurrentSrc] = useState(normalizedSrc);

  return (
    <Image
      {...rest}
      src={currentSrc}
      alt={alt}
      className={className}
      loading={rest.priority ? undefined : (loading ?? 'lazy')}
      onError={() => {
        if (currentSrc !== FALLBACK_SRC) {
          setCurrentSrc(FALLBACK_SRC);
        }
      }}
    />
  );
}
