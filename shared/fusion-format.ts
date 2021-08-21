// fusion format stuff
// fusion files are lua files that contain just a table. it works similar to json, but lets you do some more stuff
// this file is a mini library that lets you do stuff with fusion files without wanting to kill yourself.

import { parse } from 'luaparse';
import AST from 'luaparse';
import util from 'util';

function astToJSON(t: AST.Node): any {
  switch(t.type) {
    case 'StringLiteral':
    case 'NumericLiteral':
    case 'VarargLiteral':
    case 'NilLiteral':
    case 'BooleanLiteral':
      return t.value;
    case 'Identifier':
      return t.name;
    case 'TableCallExpression': {
      const x = astToJSON(t.arguments);
      x._type = astToJSON(t.base); 
      return x;
    };
    case 'TableConstructorExpression': {
      const x: any = t.fields.some(x=>x.type==='TableValue') ? [] : {};
      t.fields.forEach((field, i) => {
        x['key' in field ? astToJSON(field.key) as string : i] = astToJSON(field.value);
      });
      return x;
    }
    case 'CallExpression': {
      return {
        func: astToJSON(t.base),
        args: t.arguments.map(x => astToJSON(x)),
      };
    }
    case 'UnaryExpression': {
      const x = astToJSON(t.argument);
      switch(t.operator) {
        case '-':
          return -x;
        default:
          throw new Error(`unhandled operator ${t.operator}`);
      }
    }
    default:
      throw new Error(`unhandled type ${t.type}`);
  }
}
function jsonToAST(x: any): AST.Expression {
  if (typeof x === 'string') {
    return {
      type: 'StringLiteral',
      value: x,
      raw: x,
    };
  } else if (typeof x === 'number') {
    return {
      type: 'NumericLiteral',
      value: x,
      raw: x.toString(),
    };
  } else if (typeof x === 'boolean') {
    return {
      type: 'BooleanLiteral',
      value: x,
      raw: x.toString(),
    };
  } else if (x === null) {
    return {
      type: 'NilLiteral',
      value: null,
      raw: 'nil',
    };
  } else if (Array.isArray(x)) {
    return {
      type: 'TableConstructorExpression',
      fields: x.map((x) => ({
        type: 'TableValue',
        value: jsonToAST(x),
      })),
    };
  } else if (typeof x === 'object') {
    return {
      type: 'TableConstructorExpression',
      fields: Object.entries(x).map(([k, v]) => ({
        type: 'TableValue',
        value: jsonToAST(v),
        key: {
          type: 'StringLiteral',
          value: k,
        },
      })),
    };
  } else {
    throw new Error(`unhandled type ${typeof x}`);
  }
}
function astToString(t: AST.Node): string {
	switch(t.type) {
		case 'StringLiteral':
		case 'NumericLiteral':
		case 'BooleanLiteral':
			return JSON.stringify(t.value);
		case 'NilLiteral':
			return 'nil';
		case 'Identifier':
			return t.name;
		case 'TableCallExpression':
			return `${astToString(t.base)} ${astToString(t.arguments)}`;
		case 'TableConstructorExpression': {
			if (t.fields.length === 0) {
				return '{}';
			}
			let multiline = true;
			if (t.fields.length < 5 && t.fields.every(x => x.type === 'TableValue') && t.fields.every(x => x.value.type.includes('Literal'))) {
				multiline = false;
			}
			if (multiline) {
				return `{\n${t.fields.map(x => `\t${astToString(x).replace(/\n/g, '\n\t')},\n`).join('')}}`;
			} else {
				return `{ ${t.fields.map(x => `${astToString(x).replace(/\n/g, '\t')}`).join(', ')} }`;
			} 
		}
		case 'CallExpression':
			return `${astToString(t.base)}(${t.arguments.map(x => astToString(x)).join(',')})`;
		case 'UnaryExpression':
			return `${t.operator}${astToString(t.argument)}`;
		case 'TableKeyString':
		case 'TableKey': {
			const k = astToString(t.key);
			return `${t.key.type === 'Identifier' ? k : `[${k}]`} = ${astToString(t.value)}`;
		}
		case 'TableValue':
			return astToString(t.value);
		default:
			throw new Error(`unhandled type ${t.type}`);
	}
}

function getOnTable(t: AST.TableConstructorExpression, key: string | number) {
  if (typeof key === 'number') {
    return t.fields.filter(x => x.type === 'TableValue')[key]?.value;
  } else {
    return t.fields.find(x => 'key' in x && astToJSON(x.key) === key)?.value;
  }
}

export class LuaTable {
  protected root: AST.TableConstructorExpression | AST.TableCallExpression;
  protected table: AST.TableConstructorExpression;

  constructor(data: string | AST.TableConstructorExpression | AST.TableCallExpression | LuaTable) {
    if (typeof data === 'string') {
      const root = parse('__value__=' + data, { encodingMode: 'x-user-defined' });
      this.root = (root.body[0] as AST.AssignmentStatement).init[0] as AST.TableConstructorExpression | AST.TableCallExpression;  
    } else if (data instanceof LuaTable) {
      this.root = data.root;
    } else {
      this.root = data;
    }
    this.table = this.root.type === 'TableCallExpression' ? this.root.arguments as AST.TableConstructorExpression : this.root;
  }

  keys(): (string | number)[] {
    return this.table.fields.filter(x => 'key' in x).map((x, i) => 'key' in x ? astToJSON(x.key) : i);
  }

  get(key: string | number) {
    const value = getOnTable(this.table, key);
    if (!value) return undefined;
    if (value.type === 'TableCallExpression' || value.type === 'TableConstructorExpression') {
      return new LuaTable(value);
    }
    return astToJSON(value);
  }

  set(key: string, value: any) {
    const field = this.table.fields.find(x => 'key' in x && astToJSON(x.key) === key);
    if (!field) {
      this.table.fields.push({
        type: 'TableKey',
        value: jsonToAST(value),
        key: {
          type: 'Identifier',
          name: key,
        },
      });
    } else {
      field.value = jsonToAST(value);
    }
  }

  toString(): string {
	return astToString(this.root);
  }

  [util.inspect.custom](depth: number, options: any) {
    const name = (this.root as any)?.base?.name || '';
    const type = options.stylize(`[${this.constructor.name}${name ? ' ' + name : ''}]`, 'special')
    
    if (depth < 0) {
      return type;
    }

    const newOptions = Object.assign({}, options, {
      depth: options.depth === null ? null : options.depth - 1
    });
  
    let inner = this.keys().map(key => {
      const value = this.get(key);
      return `  ${key}: ${util.inspect(value, newOptions).replace(/\n/g, `\n  `)},`;
    }).join('\n').slice(0, -1);
    inner = `\n${inner}\n`.replace(/^\n\n$/, '');

    if (this.table.fields.length === 1) {
      inner = inner.slice(2, -1) + ' ';
    }

    return `${type} {${inner}}`;
  }
}

export class FComposition extends LuaTable {
  get CurrentTime(): number { return this.get('CurrentTime'); }
  set CurrentTime(value: number) { this.set('CurrentTime', value); }
  get RenderRange(): [number, number] { return this.get('RenderRange'); }
  set RenderRange(value: [number, number]) { this.set('RenderRange', value); }
  get RenderRangeStart(): number { return this.RenderRange[0] }
  set RenderRangeStart(value: number) { this.RenderRange = [value, this.RenderRange[1]]; }
  get RenderRangeEnd(): number { return this.RenderRange[1] }
  set RenderRangeEnd(value: number) { this.RenderRange = [this.RenderRange[0], value]; }
  get RenderRangeLength(): number { return this.RenderRange[1] - this.RenderRange[0]; }
  get GlobalRange(): [number, number] { return this.get('GlobalRange'); }
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

export class FTool extends LuaTable {
  get Type(): string { return astToJSON((this.root as any).base) }
  set Type(value: string) { (this.root as any).base = { type: 'Identifier', name: value }; }

  get Inputs(): LuaTable { return this.get('Inputs'); }

  get FlowX(): number { return this.get('ViewInfo').get('Pos').get(0); }
  set FlowX(value: number) { this.get('ViewInfo').get('Pos').set(0, value); }
  get FlowY(): number { return this.get('ViewInfo').get('Pos').get(1); }
  set FlowY(value: number) { this.get('ViewInfo').get('Pos').set(1, value); }
}
