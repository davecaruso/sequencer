import { useResource } from '../../../frontend-state';
import { MediaViewer } from './MediaViewer';

export interface ViewerBaseProps {
  id: string;
  playhead: number;
  isPlaying: boolean;
}

const viewerRegistry = {
  media: MediaViewer,
};

export function ClipViewer(props: ViewerBaseProps) {
  const clip = useResource('sequence-clip', props.id);
  const Comp = viewerRegistry[clip.clipType];
  return <Comp {...props} />;
}
