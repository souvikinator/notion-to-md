import type { Page, Plugin } from '../core/types';
import { isFileValue } from '../tree/properties';

export interface FrontmatterOptions {
  /** Only these properties. Default: all. */
  include?: string[];
  exclude?: string[];
  /** Property name → frontmatter key, e.g. `{ Name: 'title' }`. */
  rename?: Record<string, string>;
  /** Extra or overriding fields computed from the page. */
  extra?: (page: Page) => Record<string, unknown>;
}

const PLAIN_KEY = /^[A-Za-z0-9_][A-Za-z0-9_ -]*(?<! )$/;

/** Adds the page properties as YAML frontmatter at the top of the content. */
export function frontmatter(options: FrontmatterOptions = {}): Plugin {
  return {
    name: 'frontmatter',
    result(page) {
      const fields: Record<string, unknown> = {};
      for (const [name, value] of Object.entries(page.properties)) {
        if (options.include && !options.include.includes(name)) continue;
        if (options.exclude?.includes(name)) continue;
        fields[options.rename?.[name] ?? name] = value;
      }
      Object.assign(fields, options.extra?.(page));
      if (Object.keys(fields).length === 0) return page;
      return { ...page, content: `${toYaml(fields)}\n${page.content}` };
    },
  };
}

/** YAML via JSON values: JSON strings, numbers, arrays and objects are valid YAML flow scalars and collections. */
function toYaml(fields: Record<string, unknown>): string {
  const lines = Object.entries(fields).map(([key, value]) => {
    const yamlKey = PLAIN_KEY.test(key) ? key : JSON.stringify(key);
    return `${yamlKey}: ${JSON.stringify(simplify(value) ?? null)}`;
  });
  return ['---', ...lines, '---', ''].join('\n');
}

/** Files become their URLs. */
function simplify(value: unknown): unknown {
  if (!Array.isArray(value)) return value;
  return value.map((item: unknown) =>
    isFileValue(item) ? item.url : simplify(item),
  );
}
