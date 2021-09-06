// Creative Toolkit - by dave caruso
// Window Manager

import { app, BrowserWindow } from 'electron';
import { v4 } from 'uuid';
import { WindowResource } from '../shared/types';
import { addResource, getState, updateState } from './backend-state';

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
        nativeWindowOpen: true,
      },
      frame: false,
    }),
  };

  if (__DEV__) {
    def.win.loadURL('http://localhost:3000#' + id);
  } else {
    def.win.loadURL(`file://${__dirname}/index.html#` + id);
  }

  windows.set(id, def);

  addResource({
    id,
    type: 'window',
    minimized: false,
    maximized: false,
    pinned: false,
  } as WindowResource);

  def.win.on('closed', () => {
    windows.delete(id);
  });

  function updateWindowResource() {
    updateState((state) => {
      const winResource = state.resources[id] as WindowResource;
      winResource.minimized = def.win.isMinimized();
      winResource.maximized = def.win.isMaximized();
      winResource.pinned = def.win.isAlwaysOnTop();
    });
  }

  def.win.on('minimize', updateWindowResource);
  def.win.on('maximize', updateWindowResource);
  def.win.on('unmaximize', updateWindowResource);
  def.win.on('restore', updateWindowResource);
  def.win.on('always-on-top-changed', updateWindowResource);

  return;
}

// TODO: Remove this function, and go on a per-resource subscription approach
export function sendUpdateToAllWindows() {
  windows.forEach((v) => v.win.webContents.send('update', getState()));
}

export function closeWindow(id: string) {
  const win = windows.get(id);
  if (win) {
    win.win.close();
    windows.delete(id);
  }

  if (windows.size === 0) {
    app.exit();
  }
}

export function closeAllWindows() {
  windows.forEach((v) => v.win.close());
  windows.clear();
}

export function getWindow(id: string) {
  return windows.get(id)?.win;
}
