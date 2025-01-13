import { useState, useCallback } from 'react';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useAsync<T>() {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const setData = useCallback((data: T) => {
    setState({
      data,
      loading: false,
      error: null,
    });
  }, []);

  const setError = useCallback((error: Error) => {
    setState({
      data: null,
      loading: false,
      error,
    });
  }, []);

  const run = useCallback(
    async (promise: Promise<T>) => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const data = await promise;
        setData(data);
        return data;
      } catch (error) {
        setError(error instanceof Error ? error : new Error(String(error)));
        throw error;
      }
    },
    [setData, setError]
  );

  const retry = useCallback(async () => {
    if (state.error) {
      setState(prev => ({ ...prev, loading: true, error: null }));
    }
  }, [state.error]);

  return {
    ...state,
    run,
    retry,
    setData,
    setError,
  };
}

export function createAsyncCallback<T, Args extends any[]>(
  callback: (...args: Args) => Promise<T>,
  options: {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    onSettled?: () => void;
  } = {}
) {
  const { onSuccess, onError, onSettled } = options;

  return async (...args: Args): Promise<T | undefined> => {
    try {
      const data = await callback(...args);
      onSuccess?.(data);
      return data;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      onError?.(err);
      throw err;
    } finally {
      onSettled?.();
    }
  };
} 
