import { AppState } from './types';

declare interface CreativeToolkitGlobal {
  setUpdateHandler(cb: (p: AppState) => void): void;
  requestUpdate(): void;
  dispatchAction(name: string, data: unknown): Promise<unknown>;
}

declare const CTK: CreativeToolkitGlobal;
