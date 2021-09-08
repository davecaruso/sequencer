// Creative Toolkit - by dave caruso
// Root Component

import React, { Suspense } from 'react';
import { useResource, winId } from '../frontend-state';
import { Titlebar } from './Titlebar';

export function App() {
  return (
    <>
      <Titlebar />
      <Suspense fallback={'loading'}>
        {JSON.stringify(useResource('window', winId), null, 2)}
      </Suspense>
    </>
  );
}
