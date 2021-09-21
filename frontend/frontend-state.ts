import EventEmitter from 'eventemitter3';
import { useEffect, useState } from 'react';

import type { FrontendActionObject } from '../backend/backend-state';
import type { Resource, ResourceType, ResourceTypes } from '../backend/resource';
import { WindowResource } from '../backend/resources/window';
import { UiStateTypes, useUIState } from './uistate';

const resources = new Map<string, Resource>();
const promises = new Map<string, Promise<void>>();
const events = new EventEmitter();

export const winId = location.hash.slice(1);

resources.set(`window://${winId}`, {
  id: winId,
  type: 'window',
  minimized: false,
  maximized: false,
  pinned: false,
  resources: [`window://${winId}`],
} as WindowResource);

function handleUpdate(resource: Resource) {
  const key = `${resource.type}://${resource.id}`;
  resources.set(key, resource);
  events.emit(key, resource);
}

CTK.initialize(handleUpdate);

export function useResource<T extends ResourceType>(type: T, id: string): ResourceTypes[T] {
  const key = `${type}://${id}`;
  if (!resources.has(key)) {
    if (promises.has(key)) {
      throw promises.get(key);
    }
    const promise = CTK.subscribe(type, id).then(() => {
      promises.delete(key);
    });
    promises.set(key, promise);
  }

  const update = useState(false)[1];
  useEffect(() => {
    function f() {
      update((x) => !x);
    }
    events.on(key, f);
    return () => void events.off(key, f);
  }, [key]);

  return resources.get(key) as ResourceTypes[T];
}

export function useAllResources<T extends ResourceType>(
  type: T,
  ids: string[]
): ResourceTypes[T][] {
  const promiseList = [];
  for (const id of ids) {
    const key = `${type}://${id}`;
    if (!resources.has(key)) {
      if (promises.has(key)) {
        promiseList.push(promises.get(key));
      }
      const promise = CTK.subscribe(type, id).then(() => {
        promises.delete(key);
      });
      promises.set(key, promise);
    }
  }

  if (promiseList.length > 0) {
    throw Promise.all(promiseList);
  }

  const update = useState(false)[1];
  useEffect(() => {
    function f() {
      update((x) => !x);
    }
    ids.forEach((id) => {
      events.on(`${type}://${id}`, f);
    });
    return () => {
      ids.forEach((id) => {
        events.off(`${type}://${id}`, f);
      });
    };
  }, [ids.join('+')]);

  return ids.map((id) => resources.get(`${type}://${id}`) as ResourceTypes[T]);
}

export function useProject(resource: { project: string }) {
  return useResource('project', resource.project);
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
          return CTK.dispatch(`${group}_${key}` as any, args);
        };

        methodCache.set(key, method);
        return method;
      },
    });
    groupCache.set(group, innerProxy);
    return innerProxy;
  },
}) as FrontendActionObject;
