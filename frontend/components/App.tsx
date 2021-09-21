// Creative Toolkit - by dave caruso
// Root Component

import { Suspense } from 'react';
import { SequenceEditor } from './SequenceEditor/SequenceEditor';
import { Titlebar } from './Titlebar';

class ErrorBoundary extends React.Component<{}, { hasError: boolean }> {
  constructor(props: {}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}

export function App() {
  return (
    <>
      <Titlebar />
      <ErrorBoundary>
        <Suspense fallback={'Loading...'}>
          <SequenceEditor id='C:\Code\creative-toolkit\sample\test.sq' />
        </Suspense>
      </ErrorBoundary>
    </>
  );
}
