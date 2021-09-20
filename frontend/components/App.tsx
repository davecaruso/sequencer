// Creative Toolkit - by dave caruso
// Root Component

import React, { Suspense } from 'react';
import { SequenceEditor } from './SequenceEditor';
import { Titlebar } from './Titlebar';

export function App() {
  return (
    <>
      <Titlebar />
      <Suspense fallback={'loading'}>
        <SequenceEditor id='C:\Code\creative-toolkit\sample\test.sq' />
      </Suspense>
    </>
  );
}
