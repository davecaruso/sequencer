import { contextBridge, ipcRenderer } from 'electron';
import { Resource, ResourceType } from './resource';

import type { dispatch } from './backend-state';

// Remove Electron Security Warnings
if (process.env.NODE_ENV !== 'production') {
  const warn = console.warn;
  console.warn = (...args) => {
    if (!/^%cElectron Security Warning/.test(args[0])) {
      Reflect.apply(warn, console, args);
    }
  };
}

export type ResourceHandler = (resource: Resource) => void;

let resourceHandler: ResourceHandler;

// CTK API
const CTK = {
  initialize(handler: ResourceHandler) {
    resourceHandler = handler;
    ipcRenderer.send('preload-ready');
  },
  async subscribe(type: ResourceType, id: string) {
    const r = await ipcRenderer.invoke('subscribe', type, id);
    resourceHandler(r);
  },
  async unsubscribe(type: ResourceType, id: string) {
    await ipcRenderer.invoke('unsubscribe', type, id);
  },
  dispatch: (async (actionId, ...data) => {
    return await ipcRenderer.invoke('dispatch', actionId, data);
  }) as typeof dispatch,
};

export type CTKGlobal = typeof CTK;

ipcRenderer.on('resource', (ev, update) => {
  resourceHandler(update);
});

contextBridge.exposeInMainWorld('CTK', CTK);
