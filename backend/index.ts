// Creative Toolkit - by dave caruso
// Backend Entry Point

import './args';
import { app, ipcMain } from 'electron';
import { addResource, dispatch, getState } from './backend-state';
import { openWindow } from './window';
import { Sequence } from '../shared/types';

ipcMain.on('request-update', async (ev) => {
  ev.sender.send('update', getState());
});

ipcMain.handle('dispatch', async (ev, name, data) => {
  return await dispatch(name, data);
});

app.on('ready', async () => {
  addResource<Sequence>({
    id: 'ac8d6ce4-524d-4533-9381-4a71eba3b7ac',
    type: 'sequence',
    description: '',
    clips: {},
    path: 'C:/Code/creative-toolkit/sample/test.sq',
    lastAudioRenderTime: 0,
  });

  await openWindow();
});
