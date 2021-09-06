import React from 'react';
import { Actions, useResource } from '../frontend-state';
import { useUIState } from '../uistate';

export interface FileTreeProps {
  item: string;
}

export function FileTree({ item }: FileTreeProps) {
  const resource = useResource(item);
  const uistate = useUIState('file-tree-item', item);
  if (!resource) {
    throw Actions.filetree.fetchItem(item);
  }

  function $click() {}

  return (
    <div onClick={$click}>
      {item} {JSON.stringify(resource)} {JSON.stringify(uistate)}
    </div>
  );
}
