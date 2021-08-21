import { writeFile } from 'fs-extra';
import path from 'path';
import { AppState, SequenceFusionClip } from '../shared/types';

interface ISQ_AddFusionClip {
  id: string;
  clip: SequenceFusionClip;
}

const root = 'C:\\Code\\creative-toolkit\\sample'

export async function SQ_AddFusionClip(state: AppState, { id, clip }: ISQ_AddFusionClip) {
  state.project.resources[id].fusion[clip.source] = clip;

  writeFile(
    path.join(root, clip.source),
    'fuck' 
  )
  
}
