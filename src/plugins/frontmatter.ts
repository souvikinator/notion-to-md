import type { Page, Plugin } from '../core/types';
import { mapFiles } from '../tree/values';

export interface FrontmatterOptions {
  /** Only these properties. Default: all. */
  include?: string[];
  exclude?: string[];
  /** Property name → frontmatter key, e.g. `{ Name: 'title' }`. */
  rename?: Record<string, string>;
  /** Extra or overriding fields computed from the page. */
  extra?: (page: Page) => Record<string, unknown>;
}

const PLAIN_KEY = /^[A-Za-z_][A-Za-z0-9_ -]*(?<! )$/;
/** Plain keys YAML would read as a boolean or null instead of a string. */
const YAML_KEYWORDS = /^(true|false|yes|no|on|off|null|y|n)$/i;

/** Adds the page properties as YAML frontmatter at the top of the content. Files are written as their URLs. */
export function frontmatter(options: FrontmatterOptions = {}): Plugin {
  return {
    name: 'frontmatter',
    result(page) {
      const fields: Record<string, unknown> = {};
      for (const [name, value] of Object.entries(page.properties)) {
        if (options.include && !options.include.includes(name)) continue;
        if (options.exclude?.includes(name)) continue;
        fields[options.rename?.[name] ?? name] = mapFiles(
          value,
          (file) => file.url,
        );
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
    const plain = PLAIN_KEY.test(key) && !YAML_KEYWORDS.test(key);
    return `${plain ? key : JSON.stringify(key)}: ${JSON.stringify(value ?? null)}`;
  });
  return ['---', ...lines, '---', ''].join('\n');
}
