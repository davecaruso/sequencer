import React from 'react';
import { Sequence } from '../shared/types';
import { SequenceEditor } from './SequenceEditor';
import { useAppState } from './state';
import pkg from '../package.json';

export function App() {
  const app = useAppState();
  if (!app) return null;

  return (
    <div>
      ctk v{pkg.version}
      <SequenceEditor
        resource={app.resources['ac8d6ce4-524d-4533-9381-4a71eba3b7ac'] as Sequence}
      />
    </div>
  );
}
