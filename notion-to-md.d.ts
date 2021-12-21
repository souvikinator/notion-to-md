interface MdBlock {
  parent: string;
  children: MdBlock[];
}

declare module "notion-to-md" {
  export default class Notion2md {
    constructor({ notionClient }: { notionClient: any });
    pageToMarkdown(id: string, totalPage: number): Promise<MdBlock[]>;
    toMarkdownString(mdBlocks: MdBlock[]): string;
  }
}
