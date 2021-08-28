// Creative Toolkit - by dave caruso
// System actions, aka wrappers around generic electron apis

import { AppState } from '../../shared/types';
import { dialog, shell } from 'electron';
import path from 'path';

export async function system_openPath(state: AppState, file: string) {
  shell.openPath(path.resolve(file));
}

export async function system_showItemInFolder(state: AppState, file: string) {
  shell.showItemInFolder(path.resolve(file));
}

export async function system_openExternal(state: AppState, url: string) {
  shell.openExternal(url);
}

export async function system_showOpenDialog(state: AppState, options: Electron.OpenDialogOptions) {
  return await dialog.showOpenDialog(options);
}

export async function system_showSaveDialog(state: AppState, options: Electron.SaveDialogOptions) {
  return await dialog.showSaveDialog(options);
}
