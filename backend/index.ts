// Creative Toolkit - by dave caruso
// Backend Entry Point

import './args';
import { app, dialog, ipcMain } from 'electron';
import { addResource, dispatch, getState } from './backend-state';
import { openWindow } from './window';
import { Sequence } from '../shared/types';
import { readJson } from 'fs-extra';

ipcMain.on('request-update', async (ev) => {
  ev.sender.send('update', getState());
});

ipcMain.handle('dispatch', async (ev, name, data) => {
  return await dispatch(name, data);
});

app.on('ready', async () => {
  const file = dialog.showOpenDialogSync({
    properties: ['openFile'],
    title: 'Open Sequence',
    filters: [
      {
        name: 'Sequence',
        extensions: ['sq'],
      },
    ],
  });

  if (!file) {
    const savePath = dialog.showSaveDialogSync({
      title: 'Save Sequence',
      filters: [
        {
          name: 'Sequence',
          extensions: ['sq'],
        },
      ],
    });

    if (!savePath) {
      app.quit();
      return;
    }

    await addResource<Sequence>({
      id: 'ac8d6ce4-524d-4533-9381-4a71eba3b7ac',
      type: 'sequence',
      description: '',
      clips: {},
      path: savePath,
      lastAudioRenderTime: 0,
    });
  } else {
    const sequence = await readJson(file[0]);
    await addResource<Sequence>(sequence);
  }

  await openWindow();
});
