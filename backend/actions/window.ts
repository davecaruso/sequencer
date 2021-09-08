// Creative Toolkit - by dave caruso
// Window Actions, used by the titlebar

import { ActionEvent } from '../backend-state';

export async function window_minimize(event: ActionEvent, windowId: string) {
  const { __window: window } = await event.fetchResource('window', windowId);
  if (window) {
    window.minimize();
  }
}

export async function window_maximize(event: ActionEvent, windowId: string) {
  const { __window: window } = await event.fetchResource('window', windowId);
  if (window) {
    if (window.isMaximized()) {
      window.unmaximize();
    } else {
      window.maximize();
    }
  }
}

export async function window_close(event: ActionEvent, windowId: string) {
  const { __window: window } = await event.fetchResource('window', windowId);
  if (window) {
    window.close();
  }
  // TODO: remove window from state
}

export async function window_pin(event: ActionEvent, windowId: string) {
  const { __window: window } = await event.fetchResource('window', windowId);
  if (window) {
    window.setAlwaysOnTop(!window.isAlwaysOnTop());
  }
}
