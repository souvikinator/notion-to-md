import { ListBlockChildrenResponseResult } from "../../types";

export function isMediaBlock(block: ListBlockChildrenResponseResult): boolean {
  // @ts-ignore
  return ["image", "video", "file", "pdf"].includes(block.type);
}

export function isPageRefBlock(
  block: ListBlockChildrenResponseResult,
): boolean {
  //@ts-ignore - Check for page mentions in paragraphs
  if (block.type === "paragraph") {
    // @ts-ignore
    const hasPageMention = block.paragraph.rich_text.some(
      (text: any) => text.type === "mention" && text.mention?.type === "page",
    );
    if (hasPageMention) return true;
  }
  // @ts-ignore - Check for direct page links
  return block.type === "link_to_page";
}
