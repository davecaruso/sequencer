import { LuaTable } from "./lua-table";

export class FTool extends LuaTable {
    get Type(): string { return LuaTable.internals.astToJSON((this.root as any).base) }
    set Type(value: string) { (this.root as any).base = { type: 'Identifier', name: value }; }
  
    get Inputs(): LuaTable { return this.get('Inputs'); }
  
    get FlowX(): number { return this.get('ViewInfo').get('Pos').get(0); }
    set FlowX(value: number) { this.get('ViewInfo').get('Pos').set(0, value); }
    get FlowY(): number { return this.get('ViewInfo').get('Pos').get(1); }
    set FlowY(value: number) { this.get('ViewInfo').get('Pos').set(1, value); }
  }
