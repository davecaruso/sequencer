// Creative Toolkit - by dave caruso
// Window Actions, used by the titlebar

import { AppState } from '../../shared/types';
import { closeWindow, getWindow } from '../window';

export function window_minimize(state: AppState, windowId: string) {
  const window = getWindow(windowId);
  if (window) {
    window.minimize();
  }
}

export function window_maximize(state: AppState, windowId: string) {
  const window = getWindow(windowId);
  if (window) {
    if (window.isMaximized()) {
      window.unmaximize();
    } else {
      window.maximize();
    }
  }
}

export function window_close(state: AppState, windowId: string) {
  closeWindow(windowId);
}

export function window_pin(state: AppState, windowId: string) {
  const window = getWindow(windowId);
  if (window) {
    window.setAlwaysOnTop(!window.isAlwaysOnTop());
  }
}
