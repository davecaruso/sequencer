import { readFile, writeFile } from 'fs-extra';
import { ChildResource, createResourceType, Resource } from '../resource';
import { getProjectFileFromFile } from './project';

export interface Sequence extends Resource {
  type: 'sequence';
  project: string;
  version: number;
  description: string;
  clips: string[];
  width: number;
  height: number;
  fps: number;
}

export interface SequenceFileFormat {
  version: number;
  description: string;
  clips: SequenceClip[];
  width: number;
  height: number;
  fps: number;
}

export interface SequenceClipBase extends ChildResource<Sequence> {
  type: 'sequence-clip';
  clipType: string;
  source: string;
  description: string;
  isDisabled: boolean;
  track: number;
  offset: number;
  duration: number;
}

export type SequenceClip = MediaClip;

export interface MediaClip extends SequenceClipBase {
  clipType: 'media';
  source: string;
  trimStart: number;
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
    const project = await getProjectFileFromFile(filepath);
    return {
      type: 'sequence',
      version: json.version,
      description: json.description,
      clips: json.clips.map((c) => c.id),
      project,
      width: json.width,
      height: json.height,
      fps: json.fps,
    };
  },
  async save(filepath, sq, ev) {
    const json: SequenceFileFormat = {
      version: sq.version,
      description: sq.description,
      clips: sq.clips.map((c) => ev.getChild(c)),
      width: sq.width,
      height: sq.height,
      fps: sq.fps,
    };
    await writeFile(filepath, JSON.stringify(json, null, 2));
  },
});
