import path from 'path';
import { readdir, readFile, writeFile } from 'fs-extra';
import { createResourceType, Resource } from '../resource';

export interface Project extends Resource {
  type: 'project';
  version: number;
  audioFile: string;
}

export const project = createResourceType<Project>({
  type: 'project',
  ui: {},
  async load(filepath, ev) {
    const data = await readFile(filepath, 'utf8');
    const json = JSON.parse(data) as Project;
    return {
      ...json,
      audioFile: path.resolve(path.dirname(filepath), json.audioFile),
    };
  },
  async save(filepath, json, ev) {
    const newJson = {
      ...json,
      audioFile: path.relative(path.dirname(filepath), json.audioFile),
    };

    await writeFile(filepath, JSON.stringify(newJson, null, 2));
  },
});

export async function getProjectFileFromFile(fileId: string) {
  let dir = path.dirname(fileId);
  while (dir !== '/' && dir.length > 3) {
    const contents = await readdir(dir);
    const file = contents.find((f) => f.endsWith('.ctk'));
    if (file) {
      return path.join(dir, file);
    }
    dir = path.dirname(fileId);
  }
  throw new Error('No project file found for ' + fileId);
}
