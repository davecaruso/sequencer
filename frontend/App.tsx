import React from 'react';
import { helloWorldTestAction } from '../actions/sequence';
import { SequenceEditor } from './SequenceEditor';
import { dispatchAction, useAppState } from './state';

export function App() {
  const app = useAppState();
  if (!app) return null;

  return <div>
    <h1>toolkit v0.33.0</h1>
    <p>
      resource viewer is main and main only
    </p>
    <SequenceEditor id={'main'} />
  </div>
}