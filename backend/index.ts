// Creative Toolkit - by dave caruso
// Backend Entry Point

import './args';
import { app } from 'electron';
import { createWindow } from './resources/window';

app.on('ready', async () => {
  createWindow();
});
