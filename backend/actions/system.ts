// Creative Toolkit - by dave caruso
// System actions, aka wrappers around generic electron apis

import { dialog, shell } from 'electron';
import path from 'path';
import { LegacyAppState } from '../backend-state';

export async function system_openPath(state: LegacyAppState, file: string) {
  shell.openPath(path.resolve(file));
}

export async function system_showItemInFolder(state: LegacyAppState, file: string) {
  shell.showItemInFolder(path.resolve(file));
}

export async function system_openExternal(state: LegacyAppState, url: string) {
  shell.openExternal(url);
}

export async function system_showOpenDialog(
  state: LegacyAppState,
  options: Electron.OpenDialogOptions
) {
  return await dialog.showOpenDialog(options);
}

export async function system_showSaveDialog(
  state: LegacyAppState,
  options: Electron.SaveDialogOptions
) {
  return await dialog.showSaveDialog(options);
}
