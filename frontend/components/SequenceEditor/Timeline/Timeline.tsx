import { useResource } from '../../../frontend-state';
import { ResourceViewerProps } from '../ResourceViewerProps';
import { TimelinePlayhead } from './TimelinePlayhead';
import { TimelineClip } from './TimelineClip';

import c from '../SequenceEditor.module.scss';

export function Timeline({ id }: ResourceViewerProps) {
  const sq = useResource('sequence', id);

  return (
    <div className={c.timeline}>
      <TimelinePlayhead id={id} />
      {sq.clips.map((clip, i) => {
        return <TimelineClip key={i} id={clip} />;
      })}
    </div>
  );
}
