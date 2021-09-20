import React from 'react';
import useMeasure from 'react-use-measure';

import c from './AspectRatioFrame.module.scss';

export interface AspectRatioFrameProps {
  aspectRatio: number;
  children: React.ReactNode;
}

export function AspectRatioFrame({ aspectRatio, children }: AspectRatioFrameProps) {
  const [ref, { width, height }] = useMeasure();

  return (
    <div className={c.outer}>
      <div
        className={c.absoluteContainer}
        style={{ flexDirection: height / width > aspectRatio ? 'row' : 'column' }}
        ref={ref}
      >
        <div className={c.inner} style={{ aspectRatio: `${1 / aspectRatio}` }}>
          {children}
        </div>
      </div>
    </div>
  );
}
