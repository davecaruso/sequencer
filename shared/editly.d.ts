declare module 'editly' {
  import { fabric } from 'fabric';

  export interface EditlyOptions {
    outPath: string;
    width?: number;
    height?: number;
    fps?: number;
    customOutputArgs?: string[];
    allowRemoteRequests?: boolean;
    fast?: boolean;
    defaults?: EditlyDefaults;
    clips: Clip[];
    audioTracks?: AudioTrack[];
  }

  export type PositionConstant =
    | 'top'
    | 'bottom'
    | 'center'
    | 'top-left'
    | 'top-right'
    | 'center-left'
    | 'center-right'
    | 'bottom-left'
    | 'bottom-right';

  export type PositionObject = {
    x: number;
    y: number;
    originX: PositionConstant;
    originY: PositionConstant;
  };

  export type Position = PositionConstant | PositionObject;

  export type ResizeMode = 'contain' | 'contain-blur' | 'cover' | 'stretch';

  export interface KenBurns {
    zoomDirection?: 'in' | 'out' | null;
    zoomAmount?: string;
  }

  export interface Transition {
    duration?: number;
    name?: string;
    audioOutCurve?: string;
    audioInCurve?: string;
  }

  export interface EditlyDefaults {
    layer?: Partial<Omit<Layer, 'type'>>;
    layerType: {};
    duration?: number;
    transition?: Transition;
  }

  export interface Clip {
    duration?: number;
    transition?: Transition;
    layers?: Layer[];
  }

  export type Layer =
    | VideoLayer
    | AudioLayer
    | DetachedAudioLayer
    | ImageLayer
    | ImageOverlayLayer
    | TitleLayer
    | SubtitleLayer
    | TitleBackgroundLayer
    | NewsTitleLayer
    | SlideInTextLayer
    | FillColorLayer
    | RadialGradientLayer
    | LinearGradientLayer
    | RainbowColorsLayer
    | CanvasLayer
    | FabricLayer
    | GLLayer;

  export interface VideoLayer {
    type: 'video';
    path: string;
    resizeMode?: ResizeMode;
    cutFrom?: number;
    cutTo?: number;
    width?: number;
    height?: number;
    left?: number;
    top?: number;
    originX?: 'left' | 'right';
    originY?: 'top' | 'bottom';
    mixVolume?: number;
  }

  export interface AudioLayer {
    type: 'audio';
    path: string;
    cutFrom?: number;
    cutTo?: number;
    mixVolume?: number;
  }

  export interface DetachedAudioLayer extends AudioTrack {
    type: 'detached-audio';
  }

  export interface ImageLayer extends KenBurns {
    type: 'image';
    path: string;
    resizeMode?: ResizeMode;
  }

  export interface ImageOverlayLayer extends KenBurns {
    type: 'image-overlay';
    path: string;
    position?: Position;
    width?: number;
    height?: number;
  }

  export interface TitleLayer extends KenBurns {
    type: 'title';
    text: string;
    fontPath?: string;
    textColor?: string;
    position?: Position;
  }

  export interface SubtitleLayer {
    type: 'subtitle';
    text: string;
    fontPath?: string;
    textColor?: string;
  }

  export interface TitleBackgroundLayer {
    type: 'title-background';
    text: string;
    fontPath?: string;
    textColor?: string;
    background?: FillColorLayer | LinearGradientLayer | RadialGradientLayer;
  }

  export interface NewsTitleLayer {
    type: 'news-title';
    text: string;
    fontPath?: string;
    textColor?: string;
    backgroundColor?: string;
    position?: Position;
  }

  export interface SlideInTextLayer {
    type: 'slide-in-text';
    text: string;
    fontPath?: string;
    fontSize?: number;
    color?: string;
    charSpacing?: number;
    position?: Position;
  }

  export interface FillColorLayer {
    type: 'fill-color';
    color?: string;
  }

  export interface RadialGradientLayer {
    type: 'radial-gradient';
    colors?: [string, string];
  }

  export interface LinearGradientLayer {
    type: 'linear-gradient';
    colors?: [string, string];
  }

  export interface RainbowColorsLayer {
    type: 'rainbow-colors';
  }

  export interface CanvasLayerFuncOpts {
    canvas: HTMLCanvasElement;
  }

  export interface CanvasLayerInstance {
    onRender: (progress: number) => Promise<void> | void;
    onClose: () => void;
  }

  export type CanvasLayerFunc = (opt: CanvasLayerFuncOpts) => CanvasLayerInstance;

  export interface CanvasLayer {
    type: 'canvas';
    func: CanvasLayerFunc;
  }

  export interface FabricLayerFuncOpts {
    width: number;
    height: number;
    fabric: typeof fabric;
  }

  export interface FabricLayerInstance {
    onRender: (progress: number, canvas: fabric.Canvas) => Promise<void> | void;
    onClose: () => void;
  }

  export type FabricLayerFunc = (opt: FabricLayerFuncOpts) => FabricLayerInstance;

  export interface FabricLayer {
    type: 'fabric';
    func: FabricLayerFunc;
  }

  export interface GLLayer {
    type: 'gl';
    fragmentPath: string;
    vertexPath?: string;
    speed?: number;
  }

  export interface AudioTrack {
    path: string;
    cutFrom?: number;
    cutTo?: number;
    start?: number;
    mixVolume?: number;
  }

  export default function renderEditly(opts: EditlyOptions): Promise<void>;
}
