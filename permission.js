const { Client } = require("@notionhq/client");

const notion = new Client({
  auth: "secret_HWyj8UcHh6tPTs4LjWsZxlMruBR9Gqq0agwCZMc4ehp",
});

async function getPageContent(pageId) {
  try {
    const response = await notion.blocks.children.list({
      block_id: pageId,
    });
    console.log("entering");
    console.log(JSON.stringify(response, null, 2));
  } catch (error) {
    console.log(error);
    if (error.code === "object_not_found") {
      console.error(`Access denied or page not found for page ID: ${pageId}`);
    } else {
      console.error("An error occurred:", error);
    }
  }
}

// Replace these with your actual page IDs
const parentPageId = "1f5b9cf9443c45a3a5b2f5844b1f1dc7";
const childPageId = "1404171b8be680c2be8eec44d264c8e9";
const siblingPageId = "sibling_page_id";

(async () => {
  await getPageContent(childPageId);
  // await getPageContent(parentPageId);
})();
// getPageContent(childPageId);
// getPageContent(siblingPageId);
