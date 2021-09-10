import { useCallback } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useBind<F extends (...args: never[]) => any>(
  f: F,
  ...args: Parameters<F>
): () => ReturnType<F> {
  return useCallback(() => f(...args), args);
}
