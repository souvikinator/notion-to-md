import { Client } from "@notionhq/client";
import { ListBlockChildrenResponse } from "@notionhq/client/build/src/api-endpoints";

export const getBlockChildren = async (
  notionClient: Client,
  block_id: string,
  totalPage: number
) => {
  try {
    let result = [];
    let pageCount = 0;
    let start_cursor = undefined;
    
    do {
      const response = (await notionClient.blocks.children.list({
        start_cursor: start_cursor,
        page_size: pageSize,
        block_id: block_id,
      })) as ListBlockChildrenResponse;
      result.push(...response.results);
      
      start_cursor = response?.next_cursor;
      pageCount += 1;
    } while(start_cursor != null && (totalPage == null || pageCount < totalPage))
    return result;
  } catch (e) {
    console.log(e);
  }
};
