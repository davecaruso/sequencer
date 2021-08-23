import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import { pathExists, readJSON, writeJSON } from 'fs-extra';
import { AppState } from '../shared/types';
import { createDraft, finishDraft } from 'immer'
import { v4 } from 'uuid';
import * as actions from '../actions/_actions';
import './paths';
import * as pathData from './paths';

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
  let error = null;
  console.log(`!!! Dispatching ${action}`);
  const start = Date.now();
  const draft = createDraft(appstate);
  appstate = { ...appstate, loading: true };
  sendUpdate();
  const cb = (actions as any)[action];
  let r;
  draft.loading = false;
  try {
    r = await cb(draft, ...data);
  } catch (e) {
    error = e;
  }
  appstate = finishDraft(draft);
  console.log(`!!! Action ${action} took ${Date.now() - start}ms`);
  sendUpdate();
  if (error) {
    throw error;
  }
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
  if (!await pathExists(path)) {
    const p = {
      "resources": {
        "ff52c06f-5bcf-49ca-86d5-cbb29d76c7da": {
          "type": "sequence",
          "name": "main",
          "fusion": {},
          "audioClips": {}
        }
      }
    };
    await writeJSON(path, p);
  }
  
  appstate = {
    projectFilepath: path,
    project: await readJSON(path),
    fileTree: {},
    layout: {},
    loading: false,
    pathdata: pathData,
  };
  sendUpdate();
}

app.on('ready', async() => {
  let projectFile = dialog.showOpenDialogSync({
    title: 'Open Project',
    properties: ['openFile', 'promptToCreate'],
    filters: [
      { name: 'Creative Toolkit', extensions: ['ctk'] },
    ],
    defaultPath: 'C:/',
    message: 'Open a Creative Toolkit project',
  });
  
  if(!projectFile) {
    app.quit();
    return;
  }

  await loadProject(projectFile[0]);
  await openWindow();
});
