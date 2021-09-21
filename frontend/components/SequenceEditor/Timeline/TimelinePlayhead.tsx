import { ResourceViewerProps } from '../ResourceViewerProps';

import c from '../SequenceEditor.module.scss';
import { pixelsPerFrame } from '../ui-config';

export function TimelinePlayhead(props: ResourceViewerProps) {
  const playStopHandler = null;
  const playhead = 10;

  function $playheadDrag(ev: React.MouseEvent) {
    if (playStopHandler) return;

    const startX = ev.clientX;

    const onMouseMove = (ev: MouseEvent) => {
      const delta = ev.clientX - startX;
      setPlayhead(Math.round(playhead + delta / pixelsPerFrame));
    };

    const onMouseUp = (ev: MouseEvent) => {
      onMouseMove(ev);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  return (
    <div
      className={c.playhead}
      style={{
        '--playhead': playhead,
      }}
      onMouseDown={$playheadDrag}
    >
      <div className={c.playheadLine} />
    </div>
  );
}
