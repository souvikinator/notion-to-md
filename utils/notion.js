exports.getBlockChildren = async (notionClient, block_id) => {
  try {
    const response = await notionClient.blocks.children.list({
      block_id,
    });
    return response.results;
  } catch (e) {
    console.log(e);
  }
};
