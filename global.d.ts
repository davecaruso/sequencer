import { AppState } from './shared/types';

declare global {
  interface CreativeToolkitGlobal {
    setUpdateHandler(cb: (p: AppState) => void): void;
    requestUpdate(): void;
    dispatchAction(name: string, data: unknown): Promise<unknown>;
  }

  const CTK: CreativeToolkitGlobal;

  const __DEV__: boolean;
}
