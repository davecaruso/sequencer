import { FTool } from "./ftool";
import { LuaTable } from "./lua-table";

export class FComposition extends LuaTable {
    get CurrentTime(): number { return this.get('CurrentTime'); }
    set CurrentTime(value: number) { this.set('CurrentTime', value); }
    get RenderRange(): [number, number] { return this.get('RenderRange').toArray();; }
    set RenderRange(value: [number, number]) { this.set('RenderRange', value); }
    get RenderRangeStart(): number { return this.RenderRange[0] }
    set RenderRangeStart(value: number) { this.RenderRange = [value, this.RenderRange[1]]; }
    get RenderRangeEnd(): number { return this.RenderRange[1] }
    set RenderRangeEnd(value: number) { this.RenderRange = [this.RenderRange[0], value]; }
    get RenderRangeLength(): number { return this.RenderRange[1] - this.RenderRange[0]; }
    get GlobalRange(): [number, number] { return this.get('GlobalRange').toArray(); }
    set GlobalRange(value: [number, number]) { this.set('GlobalRange', value); }
    get GlobalRangeStart(): number { return this.GlobalRange[0] }
    set GlobalRangeStart(value: number) { this.GlobalRange = [value, this.GlobalRange[1]]; }
    get GlobalRangeEnd(): number { return this.GlobalRange[1] }
    set GlobalRangeEnd(value: number) { this.GlobalRange = [this.GlobalRange[0], value]; }
    get GlobalRangeLength(): number { return this.GlobalRange[1] - this.GlobalRange[0]; }
    get IsHiQuality(): boolean { return this.get('HiQ'); }
    set IsHiQuality(value: boolean) { this.set('HiQ', value); }
    get PlaybackUpdateMode(): number { return this.get('PlaybackUpdateMode'); }
    set PlaybackUpdateMode(value: number) { this.set('PlaybackUpdateMode', value); }
    get Version(): string { return this.get('Version'); }
    set Version(value: string) { this.set('Version', value); }
    get SavedOutputs(): number { return this.get('SavedOutputs'); }
    set SavedOutputs(value: number) { this.set('SavedOutputs', value); }
    get HeldTools(): number { return this.get('HeldTools'); }
    set HeldTools(value: number) { this.set('HeldTools', value); }
    get DisabledTools(): number { return this.get('DisabledTools'); }
    set DisabledTools(value: number) { this.set('DisabledTools', value); }
    get LockedTools(): number { return this.get('LockedTools'); }
    set LockedTools(value: number) { this.set('LockedTools', value); }
    get AudioFilename(): string { return this.get('AudioFilename'); }
    set AudioFilename(value: string) { this.set('AudioFilename', value); }
    get AudioOffset(): number { return this.get('AudioOffset'); }
    set AudioOffset(value: number) { this.set('AudioOffset', value); }
    get IsResumable(): boolean { return this.get('Resumable'); }
    set IsResumable(value: boolean) { this.set('Resumable', value); }
    get OutputClips(): string[] { return this.get('OutputClips'); }
    set OutputClips(value: string[]) { this.set('OutputClips', value); }
    get Tools(): LuaTable { return this.get('Tools') as LuaTable; }
  
    getTool(id: string): FTool {
      return new FTool(this.Tools.get(id));
    }
  
    static create() {
      return new FComposition(`Composition {
          CurrentTime = 0,
          RenderRange = { 0, 1000 },
          GlobalRange = { 0, 1000 },
          CurrentID = 1,
          HiQ = true,
          PlaybackUpdateMode = 0,
          Version = "Node.JS",
          SavedOutputs = 0,
          HeldTools = 0,
          DisabledTools = 0,
          LockedTools = 0,
          AudioOffset = 0,
          AutoRenderRange = true,
          Resumable = true,
          OutputClips = {},
          Tools = {},
          Frames = {},
          Prefs = {}
      }`);
    }
  }
  
  