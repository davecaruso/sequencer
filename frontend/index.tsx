import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import { App } from './components/App';

window.process = { cwd: () => '' } as NodeJS.Process;

ReactDOM.render(
  <Suspense fallback={'WAITING FOR BACKEND'}>
    <App />
  </Suspense>,
  document.querySelector('#root')
);
