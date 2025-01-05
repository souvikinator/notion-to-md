import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "./src/index";

const notion = new Client({
  auth: "secret_HWyj8UcHh6tPTs4LjWsZxlMruBR9Gqq0agwCZMc4ehp",
});

// passing notion client to the option
const n2m = new NotionToMarkdown({ notionClient: notion });

(async () => {
  const mdblocks = await n2m.pageToMarkdown("1404171b8be680c2be8eec44d264c8e9");
  const mdString = n2m.toMarkdownString(mdblocks);
  console.log(mdString.parent);
})();
