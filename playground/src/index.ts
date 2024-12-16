import fs from "fs";
import { default as path, dirname } from "path";
import dotenv from "dotenv";
import { NotionToMarkdown } from "notion-to-md";
import { Client } from "@notionhq/client";
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const distPath = path.resolve(__dirname, "../dist");

const notion = new Client({
	auth: process.env.SECRET_KEY,
});

// passing notion client to the option
const n2m = new NotionToMarkdown({ notionClient: notion });

(async () => {
	const pageDescInfos = await notion.pages.retrieve({
		auth: process.env.SECRET_KEY, page_id: process.env.PAGE_ID
	});
	const mdblocks = await n2m.pageToMarkdown(process.env.PAGE_ID);
	const mdString = n2m.toMarkdownString(mdblocks);

	if (!fs.existsSync("dist")) {
		fs.mkdirSync("dist");
	}

	const title = (pageDescInfos as any)?.properties?.title?.title[0].plain_text;
	fs.writeFileSync(path.join(distPath, `${title}.md`), mdString.parent, { encoding: "utf-8" });
})();
