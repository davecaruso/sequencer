import { readFile, writeFile } from 'fs-extra';
import { ChildResource, createResourceType, Resource } from '../resource';

export interface Sequence extends Resource {
  type: 'sequence';
  version: number;
  description: string;
  clips: string[];
  lastAudioRenderTime: number;
}

export interface SequenceFileFormat {
  version: number;
  description: string;
  clips: SequenceClip[];
  lastAudioRenderTime: number;
}

export interface SequenceClip extends ChildResource<Sequence> {
  type: 'sequence-clip';
  isMedia: boolean;
  source: string;
  description: string;
  // TODO: multitrack support. this interface just shows a single track for now.
  track: number;
  offset: number;
  trimStart: number;
  trimEnd: number;
  isDisabled: boolean;
  trackType: 'audio' | 'video' | 'data';
  lastExternalRenderTime: number;
}

export type SequenceClipPartial = Omit<SequenceClip, 'parent' | 'id'>;

export const sequenceClip = createResourceType<SequenceClip>({
  type: 'sequence-clip',
  parent: 'sequence',
  ui: {},
});

export const sequence = createResourceType<Sequence>({
  type: 'sequence',
  ui: {},
  async load(filepath, ev) {
    const data = await readFile(filepath, 'utf8');
    const json = JSON.parse(data) as SequenceFileFormat;
    json.clips.forEach((clip) => {
      ev.loadChild(clip);
    });
    return {
      type: 'sequence',
      version: json.version,
      description: json.description,
      clips: json.clips.map((c) => c.id),
      lastAudioRenderTime: json.lastAudioRenderTime,
    };
  },
  async save(filepath, sq, ev) {
    const json: SequenceFileFormat = {
      version: sq.version,
      description: sq.description,
      clips: sq.clips.map((c) => ev.getChild(c)),
      lastAudioRenderTime: sq.lastAudioRenderTime,
    };
    await writeFile(filepath, JSON.stringify(json, null, 2));
  },
  async default() {
    return {
      type: 'sequence',
      version: 1,
      description: '',
      clips: [],
      lastAudioRenderTime: 0,
    };
  },
});
