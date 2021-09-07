import path from 'path';
import React from 'react';
import { FileTreeResource } from '../../shared/types';
import { Actions, useResource } from '../frontend-state';
import { updateUIState, useUIState } from '../uistate';

export interface FileTreeProps {
  item: string;
}

export function FileTree({ item }: FileTreeProps) {
  const resource = useResource(item) as FileTreeResource;
  const uistate = useUIState('file-tree-item', item);
  if (!resource) {
    throw Actions.filetree.fetchItem(item);
  }

  function $click() {
    if (resource.fileType === 'directory') {
      updateUIState('file-tree-item', item, (x) => {
        x.expanded = !x.expanded;
        if (x.expanded && !resource.contents) {
          Actions.filetree.fetchContents(item);
        }
      });
    }
  }

  return (
    <div onClick={$click}>
      {item} {JSON.stringify(resource)} {JSON.stringify(uistate)}
      {resource.fileType === 'directory' &&
        uistate.expanded &&
        resource.contents &&
        resource.contents.map((x) => <FileTree key={x} item={`${path.join(resource.id, x)}`} />)}
    </div>
  );
}
