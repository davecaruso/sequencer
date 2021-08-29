// Creative Toolkit - by dave caruso
// Root Component

import React, { Suspense } from 'react';
import { Titlebar } from './Titlebar';

export function App() {
  return (
    <>
      <Titlebar />
      <Suspense fallback={'loading'}>
        <div></div>
      </Suspense>
    </>
  );
}
