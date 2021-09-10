import { BrowserWindow, ipcMain } from 'electron';
import { dispatch } from '../backend-state';
import {
  addResource,
  createResourceType,
  fetchResource,
  Resource,
  ResourceType,
  subscribeResource,
  unsubscribeResource,
  updateResource,
} from '../resource';

export interface WindowResource extends Resource {
  type: 'window';
  minimized: boolean;
  maximized: boolean;
  pinned: boolean;
  resources: string[];
  __window?: BrowserWindow;
}

ipcMain.handle('subscribe', async (event, type: ResourceType, resourceId: string) => {
  const window = await fetchResource(
    'window',
    BrowserWindow.fromWebContents(event.sender)!.id.toString()
  );

  const resource = await fetchResource(type, resourceId);

  subscribeResource(type, resourceId, window.id);
  const trimmed = { ...resource };
  if ('__window' in trimmed) delete trimmed.__window;
  window.__window!.webContents.send('resource', trimmed);

  updateResource('window', window.id, (w) => {
    w.resources.push(`${type}://${resourceId}`);
    return w;
  });

  return resource;
});

ipcMain.handle('unsubscribe', async (event, type: ResourceType, resourceId: string) => {
  const window = await fetchResource(
    'window',
    BrowserWindow.fromWebContents(event.sender)!.id.toString()
  );

  unsubscribeResource(type, resourceId, window.id);

  updateResource('window', window.id, (w) => {
    w.resources = w.resources.filter((id) => id !== `${type}://${resourceId}`);
    return w;
  });
});

ipcMain.handle('dispatch', (event, actionId: string, data: any) => {
  return dispatch(actionId as any, data);
});

export const window = createResourceType<WindowResource>({
  type: 'window',
  ui: {},
  async load() {
    throw new Error('Cannot load type=window');
  },
});

export function createWindow() {
  const window = new BrowserWindow({
    webPreferences: {
      preload: `${__dirname}/preload.js`,
      nativeWindowOpen: true,
    },
    frame: false,
  });

  const id = window.id.toString();

  if (__DEV__) {
    window.loadURL('http://localhost:3000#' + id);
  } else {
    window.loadURL(`file://${__dirname}/index.html#` + id);
  }

  function updateWindowResource() {
    updateResource('window', id, (resource) => {
      resource.minimized = window.isMinimized();
      resource.maximized = window.isMaximized();
      resource.pinned = window.isAlwaysOnTop();
      return resource;
    });
  }

  window.on('minimize', updateWindowResource);
  window.on('maximize', updateWindowResource);
  window.on('unmaximize', updateWindowResource);
  window.on('restore', updateWindowResource);
  window.on('always-on-top-changed', updateWindowResource);

  addResource({
    id,
    type: 'window',
    minimized: false,
    maximized: false,
    pinned: false,
    resources: [`window://${id}`],
    __window: window,
  });

  subscribeResource('window', id, id);
}
