// Creative Toolkit - by dave caruso
// System actions, aka wrappers around generic electron apis

import { AppState } from '../../shared/types';
import { shell } from 'electron';
import path from 'path';

export async function system_openPath(state: AppState, file: string) {
  shell.openPath(path.resolve(file));
}

export async function system_showItemInFolder(state: AppState, file: string) {
  shell.showItemInFolder(path.resolve(file));
}
