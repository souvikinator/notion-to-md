import { Client } from "@notionhq/client";
import {
  Annotations,
  ListBlockChildrenResponseResult,
  ListBlockChildrenResponseResults,
  MdBlock,
  Text,
  NotionToMarkdownOptions,
} from "./types";
import * as md from "./utils/md";
import { getBlockChildren } from "./utils/notion";

/**
 * Converts a Notion page to Markdown.
 */
export class NotionToMarkdown {
  private notionClient: Client;
  // TODO: better way to handle this?
  private olCounter = 0;

  constructor(options: NotionToMarkdownOptions) {
    this.notionClient = options.notionClient;
  }

  /**
   * Converts Markdown Blocks to string
   * @param {MdBlock[]} mdBlocks - Array of markdown blocks
   * @param {number} nestingLevel - Defines max depth of nesting
   * @returns {string} - Returns markdown string
   */
  toMarkdownString(mdBlocks: MdBlock[] = [], nestingLevel: number = 0): string {
    let mdString = "";
    mdBlocks.forEach((mdBlocks) => {
      if (mdBlocks.parent) {
        mdString += `
${md.addTabSpace(mdBlocks.parent, nestingLevel)}
`;
      }
      if (mdBlocks.children && mdBlocks.children.length > 0) {
        mdString += this.toMarkdownString(mdBlocks.children, nestingLevel + 1);
      }
    });
    return mdString;
  }

  /**
   * Retrieves Notion Blocks based on ID and converts them to Markdown Blocks
   * @param {string} id - notion page id (not database id)
   * @param {number} totalPage - Retrieve block children request number, page_size Maximum = totalPage * 100 (Default=null)
   * @returns {Promise<MdBlock[]>} - List of markdown blocks
   */
  async pageToMarkdown(
    id: string,
    totalPage: number | null = null
  ): Promise<MdBlock[]> {
    if (!this.notionClient) {
      throw new Error(
        "notion client is not provided, for more details check out https://github.com/souvikinator/notion-to-md"
      );
    }

    const blocks = await getBlockChildren(this.notionClient, id, totalPage);

    const parsedData = await this.blocksToMarkdown(blocks);
    return parsedData;
  }

  /**
   * Converts list of Notion Blocks to Markdown Blocks
   * @param {ListBlockChildrenResponseResults | undefined} blocks - List of notion blocks
   * @param {number} totalPage - Retrieve block children request number, page_size Maximum = totalPage * 100
   * @param {MdBlock[]} mdBlocks - Defines max depth of nesting
   * @returns {Promise<MdBlock[]>} - Array of markdown blocks with their children
   */
  async blocksToMarkdown(
    blocks?: ListBlockChildrenResponseResults,
    totalPage: number | null = null,
    mdBlocks: MdBlock[] = []
  ): Promise<MdBlock[]> {
    if (!this.notionClient) {
      throw new Error(
        "notion client is not provided, for more details check out https://github.com/souvikinator/notion-to-md"
      );
    }

    if (!blocks) return mdBlocks;

    for (let i = 0; i < blocks.length; i++) {
      let block = blocks[i];

      if ("has_children" in block && block.has_children) {
        let child_blocks = await getBlockChildren(
          this.notionClient,
          block.id,
          totalPage
        );
        mdBlocks.push({
          parent: await this.blockToMarkdown(block),
          children: [],
        });

        let l = mdBlocks.length;
        await this.blocksToMarkdown(
          child_blocks,
          totalPage,
          mdBlocks[l - 1].children
        );
        continue;
      }
      let tmp = await this.blockToMarkdown(block);

      mdBlocks.push({ parent: tmp, children: [] });
    }
    return mdBlocks;
  }

  /**
   * Converts a Notion Block to a Markdown Block
   * @param {ListBlockChildrenResponseResult} block - single notion block
   * @returns {string} corresponding markdown string of the passed block
   */
  async blockToMarkdown(block: ListBlockChildrenResponseResult) {
    if (!("type" in block)) return "";

    let parsedData = "";
    const { type } = block;
    // console.log({ block });

    switch (type) {
      case "image":
        {
          let blockContent = block.image;
          const image_caption_plain = blockContent.caption
            .map((item) => item.plain_text)
            .join("");
          const image_type = blockContent.type;
          if (image_type === "external")
            return md.image(image_caption_plain, blockContent.external.url);
          if (image_type === "file")
            return md.image(image_caption_plain, blockContent.file.url);
        }
        break;

      case "divider": {
        return md.divider();
      }

      case "equation": {
        return md.codeBlock(block.equation.expression);
      }

      case "video":
      case "file":
      case "pdf":
        {
          let blockContent;
          if (type === "video") blockContent = block.video;
          if (type === "file") blockContent = block.file;
          if (type === "pdf") blockContent = block.pdf;
          if (blockContent) {
            const file_type = blockContent.type;
            if (file_type === "external")
              return md.link("image", blockContent.external.url);
            if (file_type === "file")
              return md.link("image", blockContent.file.url);
          }
        }
        break;

      case "bookmark":
      case "embed":
      case "link_preview":
        {
          let blockContent;
          if (type === "bookmark") blockContent = block.bookmark;
          if (type === "embed") blockContent = block.embed;
          if (type === "link_preview") blockContent = block.link_preview;
          if (blockContent) return md.link(type, blockContent.url);
        }
        break;

      case "table": {
        const { id, has_children } = block;
        let tableArr: string[][] = [];
        if (has_children) {
          const tableRows = await getBlockChildren(this.notionClient, id, 100);
          // console.log(">>", tableRows);
          let rowsPromise = tableRows?.map(async (row) => {
            const { type } = row as any;
            const cells = (row as any)[type]["cells"];

            /**
             * this is more like a hack since matching the type text was
             * difficult. So converting each cell to paragraph type to
             * reuse the blockToMarkdown function
             */
            let cellStringPromise = cells.map(
              async (cell: any) =>
                await this.blockToMarkdown({
                  type: "paragraph",
                  paragraph: { text: cell },
                } as ListBlockChildrenResponseResult)
            );

            const cellStringArr = await Promise.all(cellStringPromise);
            // console.log("~~", cellStringArr);
            tableArr.push(cellStringArr);
            // console.log(tableArr);
          });
          await Promise.all(rowsPromise || []);
        }
        parsedData = md.table(tableArr);
        return parsedData;
      }

      // Rest of the types
      // "paragraph"
      // "heading_1"
      // "heading_2"
      // "heading_3"
      // "bulleted_list_item"
      // "numbered_list_item"
      // "quote"
      // "to_do"
      // "toggle"
      // "template"
      // "synced_block"
      // "child_page"
      // "child_database"
      // "code"
      // "callout"
      // "breadcrumb"
      // "table_of_contents"
      // "column_list"
      // "column"
      // "link_to_page"
      // "audio"
      // "unsupported"

      default: {
        // In this case typescript is not able to index the types properly, hence ignoring the error

        // @ts-ignore
        let blockContent = block[type].text || [];
        blockContent.map((content: Text) => {
          const annotations = content.annotations;
          let plain_text = content.plain_text;

          plain_text = this.annotatePlainText(plain_text, annotations);

          if (content["href"])
            plain_text = md.link(plain_text, content["href"]);

          parsedData += plain_text;
        });
      }
    }

    switch (type) {
      case "code":
        {
          parsedData = md.codeBlock(parsedData, block[type].language);
        }
        break;

      case "heading_1":
        {
          parsedData = md.heading1(parsedData);
        }
        break;

      case "heading_2":
        {
          parsedData = md.heading2(parsedData);
        }
        break;

      case "heading_3":
        {
          parsedData = md.heading3(parsedData);
        }
        break;

      case "quote":
        {
          parsedData = md.quote(parsedData);
        }
        break;

      case "callout":
        {
          parsedData = md.callout(parsedData, block[type].icon);
        }
        break;

      case "bulleted_list_item":
        {
          parsedData = md.bullet(parsedData);
        }
        break;

        case "numbered_list_item":
        {
          parsedData = md.bullet(parsedData, ++this.olCounter);
        }
        break;

      case "to_do":
        {
          parsedData = md.todo(parsedData, block.to_do.checked);
        }
        break;
    }

    return parsedData;
  }

  /**
   * Annoate text using provided annotations
   * @param {string} text - String to be annotated
   * @param {Annotations} annotations - Annotation object of a notion block
   * @returns {string} - Annotated text
   */
  annotatePlainText(text: string, annotations: Annotations): string {
    // if text is all spaces, don't annotate
    if (text.match(/^\s*$/)) return text;

    const leadingSpaceMatch = text.match(/^(\s*)/);
    const trailingSpaceMatch = text.match(/(\s*)$/);

    const leading_space = leadingSpaceMatch ? leadingSpaceMatch[0] : "";
    const trailing_space = trailingSpaceMatch ? trailingSpaceMatch[0] : "";

    text = text.trim();

    if (text !== "") {
      if (annotations.code) text = md.inlineCode(text);
      if (annotations.bold) text = md.bold(text);
      if (annotations.italic) text = md.italic(text);
      if (annotations.strikethrough) text = md.strikethrough(text);
      if (annotations.underline) text = md.underline(text);
    }

    return leading_space + text + trailing_space;
  }
}
