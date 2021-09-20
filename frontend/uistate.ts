// Creative Toolkit - by dave caruso
// UIState, for managing frontend ui state

import { EventEmitter } from 'eventemitter3';
import { useEffect, useState } from 'react';
import { Resource } from '../backend/resource';

const events = new EventEmitter();
const uistates = new Map<string, unknown>();

export interface UiStateBase {
  id: string;
  type: string;
}

export interface UiStateTypes {
  window: WindowUIState;
  sequence: SequenceUIState;
  'sequence-clip': SequenceClipUIState;
  'file-tree-item': FileTreeItemUIState;
  project: ProjectUIState;
}

export interface WindowUIState extends UiStateBase {
  type: 'window';
}

export interface SequenceUIState extends UiStateBase {
  type: 'sequence';
}

export interface SequenceClipUIState extends UiStateBase {
  type: 'sequence-clip';
}

export interface ProjectUIState extends UiStateBase {
  type: 'project';
}

export interface FileTreeItemUIState extends UiStateBase {
  type: 'file-tree-item';
  expanded: boolean;
}

const initialStates: UiStateTypes = {
  window: {
    id: '',
    type: 'window',
  },
  sequence: {
    id: '',
    type: 'sequence',
  },
  'sequence-clip': {
    id: '',
    type: 'sequence-clip',
  },
  'file-tree-item': {
    id: '',
    type: 'file-tree-item',
    expanded: false,
  },
  project: {
    id: '',
    type: 'project',
  },
};

export function useUIState<T extends keyof UiStateTypes>(
  type: T,
  resource: string | Resource
): UiStateTypes[T] {
  const id = typeof resource === 'string' ? resource : resource.id;
  const key = `${type}://${id}`;
  if (!uistates.has(key)) {
    uistates.set(key, {
      ...JSON.parse(JSON.stringify(initialStates[type])),
      id: id,
    });
  }
  const update = useState(false)[1];
  useEffect(() => {
    function f() {
      update((x) => !x);
    }
    events.on(key, f);
    return () => void events.off(key, f);
  }, []);
  return uistates.get(key) as UiStateTypes[T];
}

type UIStateAction<T> = (state: T) => T | void;

export function updateUIState<T extends keyof UiStateTypes>(
  type: T,
  resource: string | Resource,
  action: UIStateAction<UiStateTypes[T]>
) {
  const id = typeof resource === 'string' ? resource : resource.id;
  const key = `${type}://${id}`;
  const state = uistates.get(key) ?? {
    ...initialStates[type],
    id: id,
  };
  const newState = action(state as UiStateTypes[T]);
  uistates.set(key, newState ?? state);
  events.emit(key);
}
