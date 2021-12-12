exports.getBlockChildren = async (notionClient, block_id) => {
  try {
    if (!notionClient) {
      throw new Error(
        "notion client is not provided, for more details check out https://github.com/souvikinator/notion-to-md"
      );
    }
    const response = await notionClient.blocks.children.list({
      block_id,
    });
    return response.results;
  } catch (e) {
    console.log(e);
  }
};
