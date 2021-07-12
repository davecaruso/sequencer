import React from 'react';
import { helloWorldTestAction } from '../actions/test';
import { dispatchAction, useAppState } from './state';

export function App() {
  const app = useAppState();

  return <div>
    <h1>Thing</h1>
    
    <pre><code>{JSON.stringify(app, null,2)}</code></pre>

    <button onClick={() => dispatchAction(helloWorldTestAction)}>
      do a shit
    </button>
  </div>
}