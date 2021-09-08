import { CTKGlobal } from './backend/preload';

declare global {
  const CTK: CTKGlobal;
  const __DEV__: boolean;
}
