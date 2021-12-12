const md = require("./utils/md");
const { getBlockChildren } = require("./utils/notion");

class notion2md {
  constructor(options) {
    if (!options) {
      this.notionClient = undefined;
    } else {
      this.notionClient = options.notionClient || undefined;
    }
  }

  toMarkdownString(mdBlocks = [], nestingLevel = 0) {
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

  async pageToMarkdown(id) {
    if (!id) throw new Error("pageToMarkdown takes page_id as argument");
    const blocks = await getBlockChildren(this.notionClient, id);
    const parsedData = await this.blocksToMarkdown(blocks);
    return parsedData;
  }

  /**
   * @param {object} blocks - list of notion blocks
   * @returns array of md blocks with their children
   */
  async blocksToMarkdown(blocks, mdBlocks = []) {
    if (!this.notionClient) {
      throw new Error(
        "notion client is not provided, for more details check out https://github.com/souvikinator/notion-to-md"
      );
    }

    for (let i = 0; i < blocks.length; i++) {
      let block = blocks[i];
      if (block.has_children) {
        let child_blocks = await getBlockChildren(this.notionClient, block.id);
        mdBlocks.push({ parent: this.blockToMarkdown(block), children: [] });
        let l = mdBlocks.length;
        await this.blocksToMarkdown(child_blocks, mdBlocks[l - 1].children);
        continue;
      }
      let tmp = this.blockToMarkdown(block);

      mdBlocks.push({ parent: tmp, children: [] });
    }
    return mdBlocks;
  }

  /**
   * @param {object} block - single notion block
   * @returns markdown form of the passed block
   */
  blockToMarkdown(block) {
    if (!block) throw new Error("notion block required");

    let parsedData = "",
      blockContent;
    const { type } = block;
    if (type === "image") {
      blockContent = block[type];
      const image_type = blockContent["type"];

      return md.image("image", blockContent[image_type].url);
    } else if (type === "divider") {
      return md.divider();
    } else if (type === "equation") {
      return md.codeBlock(block[type].expression);
    } else if (type === "video" || type === "file" || type === "pdf") {
      blockContent = block[type];
      const urlType = blockContent["type"];

      return md.link(type, blockContent[urlType].url);
    } else if (
      type === "bookmark" ||
      type === "embed" ||
      type === "link_preview"
    ) {
      blockContent = block[type];

      return md.link(type, blockContent.url);
    } else {
      blockContent = block[type]["text"] || [];
      blockContent.map((content) => {
        const annotations = content.annotations;
        let plain_text = content.plain_text;

        plain_text = this.annotatePlainText(plain_text, annotations);

        if (content["href"]) plain_text = md.link(plain_text, content["href"]);

        parsedData += plain_text;
      });
    }

    if (type === "code")
      parsedData = md.codeBlock(parsedData, block[type].language);
    if (type === "heading_1") parsedData = md.heading1(parsedData);
    if (type === "heading_2") parsedData = md.heading2(parsedData);
    if (type === "heading_3") parsedData = md.heading3(parsedData);
    if (type === "quote") parsedData = md.quote(parsedData);

    if (type === "numbered_list_item" || type === "bulleted_list_item")
      parsedData = md.bullet(parsedData);

    if (type === "to_do") parsedData = md.todo(parsedData, block[type].checked);

    return parsedData;
  }

  /**
   * @param {string} text string to be annotated
   * @param {object} annotations annotation object of a notion block
   */
  annotatePlainText(text, annotations) {
    if (annotations.code) text = md.inlineCode(text);
    if (annotations.bold) text = md.bold(text);
    if (annotations.italic) text = md.italic(text);
    if (annotations.strikethrough) text = md.strikethrough(text);
    if (annotations.underline) text = md.underline(text);

    return text;
  }
}

module.exports = notion2md;
