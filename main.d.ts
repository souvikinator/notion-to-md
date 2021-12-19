interface MdBlock {
  parent: string;
  children: MdBlock[];
}

declare module "notion-to-md" {
  export default class Notion2md {
    constructor({ notionClient }: { notionClient: any });
    pageToMarkdown(page_id: string, totalPage: number = 1): Promise<MdBlock[]>;
    toMarkdownString(mdBlocks: MdBlock[]): string;
    blocksToMarkdown(
      blocks: any,
      mdBlocks: MdBlock[],
      totalPage: number = 1
    ): Promise<MdBlock[]>;
    blockToMarkdown(block: any): string;
  }
}
