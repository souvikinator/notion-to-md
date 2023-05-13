import { Client } from "@notionhq/client";

import {
  Annotations,
  CustomTransformer,
  ListBlockChildrenResponseResult,
  ListBlockChildrenResponseResults,
  MdBlock,
  NotionToMarkdownOptions,
  Equation,
  Text,
  ConfigurationOptions,
  MdStringObject,
} from "./types";
import * as md from "./utils/md";
import { getBlockChildren } from "./utils/notion";

/**
 * Converts a Notion page to Markdown.
 */
export class NotionToMarkdown {
  private notionClient: Client;
  private config: ConfigurationOptions;
  private targetPage: string;
  private customTransformers: Record<string, CustomTransformer>;
  private convertImagesToBase64: boolean;

  constructor(options: NotionToMarkdownOptions) {
    this.notionClient = options.notionClient;
    const defaultConfig: ConfigurationOptions = {
      separateChildPage: false,
    };
    this.targetPage = "";
    this.config = { ...defaultConfig, ...options.config };
    this.customTransformers = {};
  }

  setCustomTransformer(
    type: string,
    transformer: CustomTransformer
  ): NotionToMarkdown {
    this.customTransformers[type] = transformer;

    return this;
  }

  /**
   * Converts Markdown Blocks to string
   * @param {MdBlock[]} mdBlocks - Array of markdown blocks
   * @param {number} nestingLevel - Defines max depth of nesting
   * @returns {MdStringObject} - Returns markdown string with child pages separated
   */
  toMarkdownString(
    mdBlocks: MdBlock[] = [],
    pageIdentifier: string = "parent",
    nestingLevel: number = 0
  ): MdStringObject {
    let mdOutput: MdStringObject = {};

    mdBlocks.forEach((mdBlocks) => {
      // NOTE: toggle in the child blocks logic
      // adding a toggle check prevents duplicate
      // rendering of toggle title

      // process parent blocks
      if (
        mdBlocks.parent &&
        mdBlocks.type !== "toggle" &&
        mdBlocks.type !== "child_page"
      ) {
        if (
          mdBlocks.type !== "to_do" &&
          mdBlocks.type !== "bulleted_list_item" &&
          mdBlocks.type !== "numbered_list_item"
        ) {
          // initialize if key doesn't exist
          mdOutput[pageIdentifier] = mdOutput[pageIdentifier] || "";

          // add extra line breaks non list blocks
          mdOutput[pageIdentifier] += `\n${md.addTabSpace(
            mdBlocks.parent,
            nestingLevel
          )}\n\n`;
        } else {
          // initialize if key doesn't exist
          mdOutput[pageIdentifier] = mdOutput[pageIdentifier] || "";

          mdOutput[pageIdentifier] += `${md.addTabSpace(
            mdBlocks.parent,
            nestingLevel
          )}\n`;
        }
      }

      // process child blocks
      if (mdBlocks.children && mdBlocks.children.length > 0) {
        if (
          mdBlocks.type === "synced_block" ||
          mdBlocks.type === "column_list" ||
          mdBlocks.type === "column"
        ) {
          let mdstr = this.toMarkdownString(mdBlocks.children, pageIdentifier);
          // mdOutput[pageIdentifier] += mdstr[pageIdentifier];
          mdOutput[pageIdentifier] = mdOutput[pageIdentifier] || "";

          Object.keys(mdstr).forEach((key) => {
            if (mdOutput[key]) {
              mdOutput[key] + mdstr[key];
            } else {
              mdOutput[key] = mdstr[key];
            }
          });
          mdOutput[pageIdentifier] += mdstr[pageIdentifier];

          // mdOutput = { ...mdOutput, ...mdstr };
        } else if (mdBlocks.type === "child_page") {
          const childPageTitle = mdBlocks.parent;
          let mdstr = this.toMarkdownString(mdBlocks.children, childPageTitle);

          if (this.config.separateChildPage) {
            // console.log("<<", mdOutput, mdstr);
            mdOutput = { ...mdOutput, ...mdstr };
            // console.log(">>", mdOutput, "\n\n");
          } else {
            mdOutput[pageIdentifier] += mdstr[childPageTitle];
          }
        } else if (mdBlocks.type === "toggle") {
          // convert children md object to md string
          const toggle_children_md_string = this.toMarkdownString(
            mdBlocks.children
          );

          mdOutput[pageIdentifier] += md.toggle(
            mdBlocks.parent,
            toggle_children_md_string["parent"]
          );
        } else {
          let mdstr = this.toMarkdownString(
            mdBlocks.children,
            pageIdentifier,
            nestingLevel + 1
          );

          mdOutput[pageIdentifier] += mdstr["parent"];
        }
      }
    });

    return mdOutput;
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
    this.targetPage = id;
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
        // Get children of this block.
        let child_blocks = await getBlockChildren(
          this.notionClient,
          block.id,
          totalPage
        );

        // Push this block to mdBlocks.
        mdBlocks.push({
          type: block.type,
          blockId: block.id,
          parent: await this.blockToMarkdown(block),
          children: [],
        });

        // Recursively call blocksToMarkdown to get children of this block.
        let l = mdBlocks.length;
        await this.blocksToMarkdown(
          child_blocks,
          totalPage,
          mdBlocks[l - 1].children
        );
        continue;
      }

      let tmp = await this.blockToMarkdown(block);
      mdBlocks.push({
        // @ts-ignore
        type: block.type,
        blockId: block.id,
        parent: tmp,
        children: [],
      });
    }
    return mdBlocks;
  }

  /**
   * Converts a Notion Block to a Markdown Block
   * @param {ListBlockChildrenResponseResult} block - single notion block
   * @returns {string} corresponding markdown string of the passed block
   */
  async blockToMarkdown(block: ListBlockChildrenResponseResult) {
    if (typeof block !== "object" || !("type" in block)) return "";

    let parsedData = "";
    const { type } = block;
    if (type in this.customTransformers && !!this.customTransformers[type]) {
      const customTransformerValue = await this.customTransformers[type](block);
      if (!!customTransformerValue || customTransformerValue === "")
        return customTransformerValue;
    }

    switch (type) {
      case "image":
        {
          let blockContent = block.image;

          const image_caption_plain = blockContent.caption
            .map((item: any) => item.plain_text)
            .join("");

          const image_type = blockContent.type;

          if (image_type === "external")
            return await md.image(
              image_caption_plain,
              blockContent.external.url,
              this.convertImagesToBase64
            );

          if (image_type === "file")
            return await md.image(
              image_caption_plain,
              blockContent.file.url,
              this.convertImagesToBase64
            );
        }
        break;

      case "divider": {
        return md.divider();
      }

      case "equation": {
        return md.equation(block.equation.expression);
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
      case "link_to_page":
        {
          let blockContent;
          let title: string = type;
          if (type === "bookmark") blockContent = block.bookmark;
          if (type === "embed") blockContent = block.embed;
          if (type === "link_preview") blockContent = block.link_preview;
          if (
            type === "link_to_page" &&
            block.link_to_page.type === "page_id"
          ) {
            blockContent = { url: block.link_to_page.page_id };
          }

          if (blockContent) return md.link(title, blockContent.url);
        }
        break;

      case "child_page":
        {
          let pageTitle: string = block.child_page.title;

          if (this.config.separateChildPage) {
            return pageTitle;
          }

          return md.heading2(pageTitle);
        }
        break;
      case "child_database":
        {
          let pageTitle = block.child_database.title || `child_database`;
          return pageTitle;
        }
        break;

      case "table": {
        const { id, has_children } = block;
        let tableArr: string[][] = [];
        if (has_children) {
          const tableRows = await getBlockChildren(this.notionClient, id, 100);
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
                  paragraph: { rich_text: cell },
                } as ListBlockChildrenResponseResult)
            );

            const cellStringArr = await Promise.all(cellStringPromise);
            tableArr.push(cellStringArr);
          });
          await Promise.all(rowsPromise || []);
        }
        return md.table(tableArr);
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
      // "template"
      // "synced_block"
      // "child_page"
      // "child_database"
      // "code"
      // "callout"
      // "breadcrumb"
      // "table_of_contents"
      // "link_to_page"
      // "audio"
      // "unsupported"

      default: {
        // In this case typescript is not able to index the types properly, hence ignoring the error
        // @ts-ignore
        let blockContent = block[type].text || block[type].rich_text || [];
        blockContent.map((content: Text | Equation) => {
          if (content.type === "equation") {
            parsedData += md.inlineEquation(content.equation.expression);
            return;
          }

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
          const { id, has_children } = block;
          let callout_string = "";

          if (!has_children) {
            return md.callout(parsedData, block[type].icon);
          }

          const callout_children_object = await getBlockChildren(
            this.notionClient,
            id,
            100
          );

          // // parse children blocks to md object
          const callout_children = await this.blocksToMarkdown(
            callout_children_object
          );

          callout_string += `${parsedData}\n`;
          callout_children.map((child) => {
            callout_string += `${child.parent}\n\n`;
          });

          parsedData = md.callout(callout_string.trim(), block[type].icon);
        }
        break;

      case "bulleted_list_item":
        {
          parsedData = md.bullet(parsedData);
        }
        break;

      case "numbered_list_item":
        {
          parsedData = md.bullet(parsedData, block.numbered_list_item.number);
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
