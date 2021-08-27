import { AppState, Sequence, SequenceClip } from '../../shared/types';
import { addResource } from '../backend-state';

export async function sequence_addClip(state: AppState, sqId: string, clip: SequenceClip) {
  const sq = state.resources[sqId] as Sequence;
  sq.clips[clip.id] = clip;
  await addResource(clip);
}

export async function sequence_deleteClip(state: AppState, clipId: string) {
  const resources = state.resources;
  const clip = resources[clipId] as SequenceClip;
  const sq = state.resources[clip.parent] as Sequence;

  // remove clip from sequence
  delete sq.clips[clip.id];

  // remove clip from resources
  delete state.resources[clipId];
}

export async function sequence_editClipProp<K extends keyof SequenceClip>(
  state: AppState,
  clipId: string,
  prop: K,
  value: SequenceClip[K]
) {
  const clip = state.resources[clipId] as SequenceClip;
  clip[prop] = value;
}
