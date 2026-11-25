'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseApiQueryResult<T> {
  data: T;
  setData: React.Dispatch<React.SetStateAction<T>>;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Lightweight data-fetching hook used across dashboard modules.
 * Works seamlessly in both local mock mode and live backend API mode.
 */
export function useApiQuery<T>(
  fetcher: () => Promise<T>,
  initialData: T
): UseApiQueryResult<T> {
  const [data, setData] = useState<T>(initialData);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fetcherRef = useRef(fetcher);

  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetcherRef.current();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const run = async () => {
      try {
        const result = await fetcherRef.current();
        if (active) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load data');
        }
      }
    };
    void run();
    return () => {
      active = false;
    };
  }, []);

  return { data, setData, isLoading, error, refetch };
}
