import path from 'path';
import React from 'react';
import { useResource } from '../frontend-state';
import { updateUIState, useUIState } from '../uistate';

export interface FileTreeProps {
  item: string;
}

export function FileTree({ item }: FileTreeProps) {
  const [resource, uistate] = useResource('file-tree-item', item);

  function $click() {
    if (resource.fileType === 'directory') {
      updateUIState('file-tree-item', item, (x) => {
        x.expanded = !x.expanded;
      });
    }
  }

  return (
    <div>
      <div onClick={$click}>{item}</div>
      {resource.fileType === 'directory' &&
        uistate.expanded &&
        resource.contents &&
        resource.contents.map((x) => <FileTree key={x} item={path.join(resource.id, x)} />)}
    </div>
  );
}
