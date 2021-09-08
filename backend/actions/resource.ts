// Creative Toolkit - by dave caruso
// TODO: DOCUMENT

import { readFile, writeFile } from 'fs-extra';
import { resolve } from 'path';
import { addResource, LegacyAppState } from '../backend-state';
import { Resource } from '../resource';

export async function resource_save(state: LegacyAppState, resource: Resource) {
  // TODO: only save modified resources
  const json = JSON.stringify({ ...resource, id: undefined }, null, 2);
  await writeFile(resource.id, json);
}

export async function resource_open(state: LegacyAppState, filePath: string) {
  filePath = resolve(filePath);
  const json = await readFile(filePath, 'utf8');
  const data = JSON.parse(json);
  data.id = filePath;
  addResource(data);
}
