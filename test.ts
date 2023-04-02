import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "./build";
import fs from "fs";

const notion = new Client({
  auth: "",
});

// passing notion client to the option
const n2m = new NotionToMarkdown({ notionClient: notion });

n2m.setCustomTransformer("synced_block", async (block) => {
  console.log(block);
  return "synked_block encountered";
});

(async () => {
  // b4f23bb4d29d44408837c3f67df8fd64
  const mdblocks = await n2m.pageToMarkdown("b4f23bb4d29d44408837c3f67df8fd64");
  const mdString = n2m.toMarkdownString(mdblocks);

  //writing to file
  fs.writeFile("test.md", mdString, (err) => {
    console.log(err);
  });
})();
