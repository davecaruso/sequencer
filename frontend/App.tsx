import React from 'react';
import { SequenceEditor } from './SequenceEditor';
import { dispatchAction, useAppState } from './state';

export function App() {
  const app = useAppState();
  if (!app) return null;

  return <div>
    {
      app.loading && <h1>loading...</h1>
    }
    <h1>toolkit v0.33.0</h1>
        <pre><code>
      {JSON.stringify(app.pathdata, null, 2)}
      </code></pre>
    <p>
      resource viewer is main and main only
    </p>
    <button onClick={() => dispatchAction('Project_Save')}>save self</button>
    <button onClick={() => dispatchAction('Project_Load')}>load data</button>
    <button onClick={() => dispatchAction('System_OpenCache')}>cache</button>
    <SequenceEditor id={'ff52c06f-5bcf-49ca-86d5-cbb29d76c7da'} />
  </div>
}