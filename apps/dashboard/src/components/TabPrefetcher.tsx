'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function TabPrefetcher({ urls }: { urls: string[] }) {
  const router = useRouter();
  useEffect(() => {
    urls.forEach((url) => router.prefetch(url));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
