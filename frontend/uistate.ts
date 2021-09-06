// Creative Toolkit - by dave caruso
// UIState, for managing frontend ui state

import { Resource } from '../shared/types';

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

export interface FileTreeItemUIState extends UiStateBase {
  type: 'file-tree-item';
  expanded: boolean;
}

const initialStates: UiStateTypes = {
  window: {
    id: 'window',
    type: 'window',
  },
  sequence: {
    id: 'sequence',
    type: 'sequence',
  },
  'sequence-clip': {
    id: 'sequence-clip',
    type: 'sequence-clip',
  },
  'file-tree-item': {
    id: 'file-tree-item',
    type: 'file-tree-item',
    expanded: false,
  },
};

export function useUIState<T extends keyof UiStateTypes>(type: T, resource: string | Resource) {
  const id = typeof resource === 'string' ? resource : resource.id;
  if (!uistates.has(id)) {
    uistates.set(id, initialStates[type]);
  }
  return uistates.get(id);
}

type UIStateAction<T> = (state: T) => T | void;

export function updateUIState<T extends keyof UiStateTypes>(
  type: T,
  resource: string | Resource,
  action: UIStateAction<UiStateTypes[T]>
) {
  const id = typeof resource === 'string' ? resource : resource.id;
  const state = uistates.get(id) ?? initialStates[type];
  const newState = action(state as UiStateTypes[T]);
  uistates.set(id, newState ?? state);
}
