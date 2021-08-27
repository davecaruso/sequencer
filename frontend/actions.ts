import type { FrontendActionObject } from '../backend/backend-state';

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
