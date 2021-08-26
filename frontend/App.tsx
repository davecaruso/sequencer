import React from 'react';
import { SequenceEditor } from './SequenceEditor';
import { dispatchAction, useAppState } from './state';
import pkg from '../package.json';

export function App() {
  const app = useAppState();
  if (!app) return null;

  return (
    <div>
      {app.loading && <h1>loading...</h1>}
      <h1>toolkit v{pkg.version}</h1>
      <pre>
        <code>{JSON.stringify(app.pathdata, null, 2)}</code>
      </pre>
      <p>resource viewer is ff52c06f-5bcf-49ca-86d5-cbb29d76c7da</p>
      <button onClick={() => dispatchAction('Project_Save')}>save self</button>
      <button onClick={() => dispatchAction('Project_Load')}>load data</button>
      <button onClick={() => dispatchAction('System_OpenCache')}>cache</button>
      <button onClick={() => dispatchAction('System_OpenProjectFolder')}>project</button>
      <SequenceEditor id={'ff52c06f-5bcf-49ca-86d5-cbb29d76c7da'} />
    </div>
  );
}
