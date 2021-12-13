export default class notion2md {
    constructor(options: {notionClient: any});

    toMarkdownString(mdBlocks: Array<any>, nestingLevel?: number): string;
    async pageToMarkdown(id: string): Array<any>
}