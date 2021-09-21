import { Inspector } from './Inspector/Inspector';
import { ResourceViewerProps } from './ResourceViewerProps';
import c from './SequenceEditor.module.scss';
import { Timeline } from './Timeline/Timeline';
import { pixelsPerFrame, trackHeight } from './ui-config';
import { ViewerFrame } from './Viewer/ViewerFrame';

export function SequenceEditor({ id }: ResourceViewerProps) {
  return (
    <div
      className={c.root}
      style={{
        '--pixels-per-frame': pixelsPerFrame,
        '--track-height': trackHeight,
      }}
    >
      <div className={c.hSplit}>
        <Inspector id={id} />
        <ViewerFrame id={id} />
      </div>
      <Timeline id={id} />
    </div>
  );
}
