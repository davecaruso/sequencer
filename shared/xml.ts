type XMLChild = XML | string | number | boolean;
type XMLChildren = XMLChild | XMLChild[];
type XMLAttrs = Record<string, string | number | boolean>;

function escapeXML(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

class XML {
  attrs: XMLAttrs;
  children: XMLChild[];
  up?: XML;

  get root(): XML {
    if (!this.up) return this;
    let ref: XML = this.up;
    while (ref.up) {
      ref = ref.up;
    }
    return ref;
  }

  constructor(readonly tagName: string, attrs?: XMLAttrs, ...children: XMLChildren[]) {
    this.attrs = attrs || {};
    this.children = children.flat();
  }

  attr(key: string, value: string | number | boolean) {
    this.attrs[key] = value;
    return this;
  }

  elem(tagName: string, attrs?: XMLAttrs, ...children: XMLChildren[]) {
    const element = new XML(tagName, attrs, ...children);
    this.children.push(element);
    element.up = this;
    return element;
  }

  add(...items: XMLChildren[]) {
    this.children.push(...items.flat());
    return this;
  }

  stringify(depth = 0): string {
    const children = this.children.map((x) =>
      x instanceof XML ? x.stringify(depth + 1) : escapeXML(x.toString())
    );
    const attrs = Object.entries(this.attrs)
      .map(([key, value]) => ` ${escapeXML(key)}="${escapeXML(value.toString())}"`)
      .join('');
    const space = '  '.repeat(depth);
    if (this.children.length > 0) {
      return `${space}<${escapeXML(this.tagName)}${attrs}>\n${children.join(
        '\n'
      )}\n${space}</${escapeXML(this.tagName)}>`;
    } else {
      return `${space}<${escapeXML(this.tagName)}${attrs} />`;
    }
  }
}

export function xml(tagName: string, attrs?: XMLAttrs, ...children: XMLChildren[]) {
  return new XML(tagName, attrs, ...children);
}
