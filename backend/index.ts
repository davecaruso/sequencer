import { app, BrowserWindow, ipcMain } from 'electron';
import { readJSON } from 'fs-extra';
import { AppState } from '../shared/types';
import { createDraft, finishDraft } from 'immer'
import { v4 } from 'uuid';
import * as actions from '../actions/_actions';
import './paths';

ipcMain.on('request-update', async(ev) => {
  ev.sender.send('update', appstate);
});

ipcMain.handle('dispatch', async(ev, name, data) => {
  return await dispatchAction(name, data);
});

interface WindowDef {
  win: BrowserWindow;
  resources: string[]
}

let windows = new Map<string, WindowDef>();
let appstate: AppState;

async function dispatchAction(action: string, data: any) {
  const cb = (actions as any)[action];
  let r;
  const draft = createDraft(appstate);
  r = await cb(draft, ...data);
  appstate = finishDraft(draft);
  sendUpdate();
  return r;
}

async function openWindow() {
  const id = v4();
  const def: WindowDef = {
    win: new BrowserWindow({
      webPreferences: {
        preload: 'C:/Code/creative-toolkit/backend/preload.js',
      },
      // transparent: true,
      // frame: false
    }),
    resources: [],
  };
  def.win.loadURL('http://localhost:3000/frontend/index.html#' + id);
  windows.set(id, def);
}

function sendUpdate() {
  windows.forEach(v => v.win.webContents.send('update', appstate));
}

async function loadProject(path: string) {
  appstate = {
    project: await readJSON(path),
    fileTree: {},
    layout: {}
  };
  sendUpdate();
}

app.on('ready', async() => {
  await loadProject(`C:/Code/creative-toolkit/sample/project.ctk`);
  await openWindow();
});
