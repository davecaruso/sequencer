import { readdir, stat } from 'fs-extra';
import { createResourceType, Resource } from '../resource';

export interface FileTreeResource extends Resource {
  type: 'file-tree-item';
  fileType: 'directory' | 'file';
  contents?: string[];
}

export const fileTreeItem = createResourceType<FileTreeResource>({
  type: 'file-tree-item',
  ui: {
    expanded: false,
  },
  async load(filepath, event) {
    console.log('file-tree-item', filepath);
    const stats = await stat(filepath);
    const isDir = stats.isDirectory();
    // TODO: only load contents when expanded in ui
    const contents = isDir ? await readdir(filepath) : [];
    return {
      type: 'file-tree-item',
      fileType: isDir ? 'directory' : 'file',
      contents,
    };
  },
});
