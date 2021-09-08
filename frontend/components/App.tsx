// Creative Toolkit - by dave caruso
// Root Component

import React, { Suspense } from 'react';
import { FileTree } from './FileTree';
import { Titlebar } from './Titlebar';

export function App() {
  return (
    <>
      <Titlebar />
      <Suspense fallback={'loading'}>
        <FileTree item='C:\Code' />
      </Suspense>
    </>
  );
}
