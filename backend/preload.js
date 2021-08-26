/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const { contextBridge, ipcRenderer } = require('electron');

// Remove Electron Security Warnings
if (process.env.NODE_ENV !== 'production') {
  const warn = console.warn;
  console.warn = (...args) => {
    if (!/^%cElectron Security Warning/.test(args[0])) {
      Reflect.apply(warn, console, args);
    }
  };
}

let updateHandler = null;

contextBridge.exposeInMainWorld('CTK', {
  setUpdateHandler(cb) {
    updateHandler = cb;
  },
  requestUpdate() {
    ipcRenderer.send('request-update');
  },
  async dispatchAction(action, data) {
    return await ipcRenderer.invoke('dispatch', action, data);
  },
});

ipcRenderer.on('update', (ev, update) => {
  updateHandler && updateHandler(update);
});
