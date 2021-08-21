import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './App';

setTimeout(() => {
  ReactDOM.render(
    <App />,
    document.querySelector('#root')
  );  
}, 100);