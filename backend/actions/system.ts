// Creative Toolkit - by dave caruso
// System actions, aka wrappers around generic electron apis

import { dialog, shell } from 'electron';
import path from 'path';
import { ActionEvent } from '../backend-state';

export async function system_openPath(event: ActionEvent, file: string) {
  shell.openPath(path.resolve(file));
}

export async function system_showItemInFolder(event: ActionEvent, file: string) {
  shell.showItemInFolder(path.resolve(file));
}

export async function system_openExternal(event: ActionEvent, url: string) {
  shell.openExternal(url);
}

export async function system_showOpenDialog(
  event: ActionEvent,
  options: Electron.OpenDialogOptions
) {
  return await dialog.showOpenDialog(options);
}

export async function system_showSaveDialog(
  event: ActionEvent,
  options: Electron.SaveDialogOptions
) {
  return await dialog.showSaveDialog(options);
}
