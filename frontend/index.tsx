import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import { App } from './components/App';
import './global.scss';

window.process = { cwd: () => '' } as NodeJS.Process;

ReactDOM.render(<App />, document.querySelector('#root'));
