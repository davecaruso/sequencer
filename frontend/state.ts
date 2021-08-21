import EventEmitter from 'eventemitter3';
import { useEffect, useState } from 'react';
import { AppState } from '../shared/types';

const events = new EventEmitter();

const winId = location.hash.slice(1);

let appstate!: AppState;

function handleUpdate(newState: any) {
  appstate = newState;
  events.emit('change');
}

CTK.setUpdateHandler(handleUpdate);
CTK.requestUpdate();

export function getAppState()  {
  return appstate;
}

export function useAppState() {
  const update = useState(false)[1];
  useEffect(() => {
    function f() {
      update(x => !x);
    }
    events.on('change', f);
    return () => void events.off('change', f);
  }, []);
  return appstate;
}

export async function dispatchAction<F extends (...a: any[]) => any>(action: F, ...args: any[]): Promise<ReturnType<F>> {
  return await CTK.dispatchAction(action.name, args);
}
