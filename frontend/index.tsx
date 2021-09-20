import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import { App } from './components/App';
import './global.scss';

window.process = { cwd: () => '' } as NodeJS.Process;

ReactDOM.render(<App />, document.querySelector('#root'));

navigator.mediaSession.setActionHandler('play', () => {});
navigator.mediaSession.setActionHandler('pause', () => {});
navigator.mediaSession.setActionHandler('seekbackward', () => {});
navigator.mediaSession.setActionHandler('seekforward', () => {});
navigator.mediaSession.setActionHandler('previoustrack', () => {});
navigator.mediaSession.setActionHandler('nexttrack', () => {});
