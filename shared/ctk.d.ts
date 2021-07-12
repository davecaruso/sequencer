declare interface CreativeToolkitGlobal {
  setUpdateHandler(cb: (p: any) => void): void;
  requestUpdate(): void;
  dispatchAction(name: string, data: any): Promise<any>;
}

declare const CTK: CreativeToolkitGlobal