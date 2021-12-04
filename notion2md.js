const md = require("./mdUtils");

module.exports = notion2md;

function notion2md(options) {
  if (!options || !options.database_id) {
    throw new Error("notion2md requires database_id in option");
  }
  data = [];
}

exports.BlocksToMarkdown = async (blocks, mdBlocks) => {
  for (let i = 0; i < blocks.length; i++) {
    let block = blocks[i];
    let { type } = block;
    if (block.has_children) {
      let child_blocks = await getAllBlocks(block.id);
      if (
        type === "numbered_list_item" ||
        type === "bulleted_list_item" ||
        type === "to_do"
      ) {
        mdBlocks.push({ parent: BlockToMarkdown(block), children: [] });
        let l = mdBlocks.length;
        await BlocksToMarkdown(child_blocks, mdBlocks[l - 1].children);
      } else {
        mdBlocks.push(BlockToMarkdown(block));
        await BlocksToMarkdown(child_blocks, mdBlocks);
      }
      continue;
    }

    mdBlocks.push(BlockToMarkdown(block));
  }
};

exports.BlockToMarkdown = (block) => {
  let parsedData = "",
    block_content;
  const { type } = block;
  if (type === "image") {
    block_content = block[type];
    const image_type = block_content["type"];
    return md.image("image", block_content[image_type].url);
  } else {
    block_content = block[type]["text"] || [];
    block_content.map((content) => {
      const annotations = content.annotations;
      let plain_text = content.plain_text;

      plain_text = annotatePlainText(plain_text, annotations);

      if (content["href"]) plain_text = md.link(plain_text, content["href"]);

      md_block += plain_text;
    });
  }

  // TODO:  need to take care of escape sequences
  if (type === "code") parsedData = md.codeBlock(parsedData);
  if (type === "heading_1") parsedData = md.heading1(parsedData);
  if (type === "heading_2") parsedData = md.heading2(parsedData);
  if (type === "heading_3") parsedData = md.heading3(parsedData);
  if (type === "quote") parsedData = md.quote(parsedData);

  if (type === "numbered_list_item" || type === "bulleted_list_item")
    parsedData = md.bullet(parsedData);

  if (type === "to_do") parsedData = md.todo(parsedData, block[type].checked);

  return parsedData;
};

const annotatePlainText = (text, annotations) => {
  if (annotations.code) text = md.inlineCode(text);
  if (annotations.bold) text = md.bold(text);
  if (annotations.italic) text = md.italic(text);
  if (annotations.strikethrough) text = md.strikethrough(text);
  if (annotations.underline) text = md.underline(text);

  return text;
};
