import EventEmitter from 'eventemitter3';
import { useEffect, useState } from 'react';
import { AppState, Resource } from '../shared/types';
import type { FrontendActionObject } from '../backend/backend-state';

const events = new EventEmitter();

export const winId = location.hash.slice(1);

let appstate!: AppState;

function handleUpdate(newState: AppState) {
  appstate = newState;
  console.log('state updated', appstate);
  events.emit('change');
}

CTK.setUpdateHandler(handleUpdate);
CTK.requestUpdate();

export function getAppState() {
  return appstate;
}

export interface UseAppStateOptions {
  suspend?: boolean;
}

export function useAppState(options?: UseAppStateOptions) {
  if (!appstate && (options?.suspend ?? true)) {
    throw new Promise((resolve) => {
      events.once('change', () => {
        resolve(appstate);
      });
    });
  }

  const update = useState(false)[1];
  useEffect(() => {
    function f() {
      update((x) => !x);
    }
    events.on('change', f);
    return () => void events.off('change', f);
  }, []);
  return appstate;
}

export function useResource<T extends Resource>(id: string, options?: UseAppStateOptions): T {
  const resources = useAppState(options)?.resources;
  return resources?.[id] as T;
}

const fakeProxyObj = {
  NOTICE:
    'The backend API is built using a JS Proxy, so you cannot see the properties. See autocomplete for a list of available methods.',
} as Record<string, unknown>;

const groupCache = new Map<PropertyKey, unknown>();
const methodCache = new Map<PropertyKey, unknown>();

export const Actions = new Proxy(fakeProxyObj, {
  get: (_, group: string) => {
    if (groupCache.has(group)) {
      return groupCache.get(group);
    }

    const innerProxy = new Proxy(fakeProxyObj, {
      get: (_, key: string) => {
        const method = (...args: unknown[]) => {
          return CTK.dispatchAction(`${group}_${key}`, args);
        };

        methodCache.set(key, method);
        return method;
      },
    });
    groupCache.set(group, innerProxy);
    return innerProxy;
  },
}) as FrontendActionObject;
