// Creative Toolkit - by dave caruso
// Functions to request File Tree items from the file system

import { readdir, stat } from 'fs-extra';
import { resolve } from 'path';
import { AppState, FileTreeResource } from '../../shared/types';
import { addResource } from '../backend-state';

export async function filetree_fetchItem(state: AppState, filePath: string) {
  const resolvedPath = resolve(filePath);

  const stats = await stat(filePath);
  const isDir = stats.isDirectory();

  const existing = state.resources[resolvedPath] as FileTreeResource;

  const entry: FileTreeResource = {
    id: resolvedPath,
    type: 'file-tree-item',
    fileType: isDir ? 'directory' : 'file',
    contents: existing?.contents ?? undefined,
  };

  await addResource(entry);

  return entry;
}

export async function filetree_fetchContents(state: AppState, filePath: string) {
  const entry = await filetree_fetchItem(state, filePath);

  if (entry.fileType === 'directory') {
    const contents = await readdir(filePath);
    entry.contents = (
      await Promise.all(contents.map((x) => filetree_fetchItem(state, `${filePath}/${x}`)))
    ).map((x) => x.id);
  }

  return entry;
}
