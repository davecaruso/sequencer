// Creative Toolkit - by dave caruso
// TODO: DOCUMENT

import { readFile, writeFile } from 'fs-extra';
import { resolve } from 'path';
import { AppState, DiskResource } from '../../shared/types';
import { addResource } from '../backend-state';

export async function resource_save(state: AppState, resource: DiskResource) {
  // TODO: only save modified resources
  const json = JSON.stringify({ ...resource, path: undefined }, null, 2);
  await writeFile(resource.path, json);
}

export async function resource_open(state: AppState, filePath: string) {
  filePath = resolve(filePath);
  const json = await readFile(filePath, 'utf8');
  const data = JSON.parse(json);
  data.path = filePath;
  addResource(data);
}
