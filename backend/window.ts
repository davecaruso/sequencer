// Creative Toolkit - by dave caruso
// Window Manager

import { BrowserWindow } from 'electron';
import { v4 } from 'uuid';
import { args } from './args';
import { getState } from './backend-state';

interface WindowDef {
  win: BrowserWindow;
}

const windows = new Map<string, WindowDef>();

export async function openWindow() {
  const id = v4();
  const def: WindowDef = {
    win: new BrowserWindow({
      webPreferences: {
        preload: 'C:/Code/creative-toolkit/backend/preload.js',
      },
      // transparent: true,
      // frame: false
    }),
  };

  if (__DEV__) {
    def.win.loadURL('http://localhost:3000#' + id);
  } else {
    def.win.loadURL(`file://${__dirname}/index.html#` + id);
  }

  windows.set(id, def);
}

// TODO: Remove this function, and go on a per-resource subscription approach
export function sendUpdateToAllWindows() {
  windows.forEach((v) => v.win.webContents.send('update', getState()));
}
