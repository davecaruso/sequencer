import { useAllResources, useResource } from '../../../frontend-state';
import { AspectRatioFrame } from '../../AspectRatioFrame';
import { ResourceViewerProps } from '../ResourceViewerProps';
import { ClipViewer } from './ClipViewer';

import c from '../SequenceEditor.module.scss';

export function ViewerFrame({ id }: ResourceViewerProps) {
  const playhead = 0;
  const isPlaying = false;

  const sq = useResource('sequence', id);
  const allClipsResolved = useAllResources('sequence-clip', sq.clips);
  const clipsAtCurrentTime = allClipsResolved
    .filter((clip) => clip.offset <= playhead && clip.offset + clip.duration > playhead)
    .sort((a, b) => a.track - b.track);

  return (
    <div className={c.viewer}>
      <AspectRatioFrame aspectRatio={sq.height / sq.width}>
        <div className={c.viewerInner}>
          {clipsAtCurrentTime.map((clip) => {
            return (
              <ClipViewer key={clip.id} id={clip.id} playhead={playhead} isPlaying={isPlaying} />
            );
          })}
        </div>
      </AspectRatioFrame>
    </div>
  );
}
