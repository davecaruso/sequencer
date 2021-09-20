import { useCallback, useEffect, useState } from 'react';

interface UseBuffer<T> {
  value: T;
  setValue(value: T): void;
  reset(): void;
  dirty: boolean;
}

export function useBuffer<T>(value: T): UseBuffer<T> {
  const [buffer, setBuffer] = useState(value);

  useEffect(() => {
    setBuffer(value);
  }, [value]);

  return {
    value: buffer,
    setValue: useCallback((value: T) => setBuffer(value), []),
    reset: useCallback(() => setBuffer(value), [value]),
    dirty: buffer !== value,
  };
}
