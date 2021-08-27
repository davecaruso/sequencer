import EventEmitter from 'eventemitter3';
import { useEffect, useState } from 'react';
import { AppState, Resource } from '../shared/types';

const events = new EventEmitter();

export const winId = location.hash.slice(1);

let appstate!: AppState;

function handleUpdate(newState: AppState) {
  appstate = newState;
  events.emit('change');
}

CTK.setUpdateHandler(handleUpdate);
CTK.requestUpdate();

export function getAppState() {
  return appstate;
}

export function useAppState() {
  if (!appstate) {
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

export function useResource<T extends Resource>(id: string): T {
  const resources = useAppState().resources;
  return resources[id] as T;
}
