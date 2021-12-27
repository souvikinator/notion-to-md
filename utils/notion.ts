import { Client } from "@notionhq/client";
import { ListBlockChildrenResponse } from "@notionhq/client/build/src/api-endpoints";

export const getBlockChildren = async (notionClient: Client, block_id: string, totalPage: number) => {
  try {
    if (!notionClient) {
      throw new Error(
        "notion client is not provided, for more details check out https://github.com/souvikinator/notion-to-md"
      );
    }
    let result = [];
    let start_cursor;
    let pageSize = 100;
    for (let i = 0; i < totalPage; i++) {
      // contain start_cursor
      const response = await notionClient.blocks.children.list({
        start_cursor: start_cursor,
        page_size: pageSize,
        block_id: block_id,
      }) as ListBlockChildrenResponse;
      let current = response.results;
      // delete start_cursor
      if (start_cursor) {
        current.shift();
      }
      result.push(...current);
      if (current.length < 100) {
        break;
      }
      pageSize = 101;
      start_cursor = current[current.length - 1].id;
    }
    return result;
  } catch (e) {
    console.log(e);
  }
};
