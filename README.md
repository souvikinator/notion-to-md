<img src="https://imgur.com/WgXdz9r.png" />

> 💡 For better readability and detailed instructions headover to the [wiki](https://github.com/souvikinator/notion-to-md/wiki)

# Notion to Markdown

Convert notion pages, block and list of blocks to markdown (supports nesting) using **[notion-sdk-js](https://github.com/makenotion/notion-sdk-js)**

> **Note:** Before getting started, create [an integration and find the token](https://www.notion.so/my-integrations).

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/O5O1AFCJR)

## Todo

- [x] heading
- [x] images
- [x] quotes
- [x] links
- [x] bullets
- [x] todo
- [x] inline code
- [x] code block
- [x] strikethrough, underline, bold, italic
- [x] nested blocks
- [ ] pages inside pages/child page
- [x] embeds, bookmarks, videos, files (converted to links)
- [x] Simple tables
- [x] divider
- [x] equation block (converted to code blocks)
- [x] convert returned markdown object to string (`toMarkdownString()`)
- [x] typescript support
- [ ] add tests

## Install

```Bash
$ npm install notion-to-md
```

## Usage

> **Note:** Details on methods can be found in [API section](https://github.com/souvikinator/notion-to-md#api)

### converting markdown objects to markdown string

This is how the notion page looks for this example:

![Imgur](https://imgur.com/O6bKCmH.png)

```js
const { Client } = require("@notionhq/client");
const { NotionToMarkdown } = require("notion-to-md");
// or
// import {NotionToMarkdown} from "notion-to-md";

const notion = new Client({
  auth: "your integration token",
});

// passing notion client to the option
const n2m = new NotionToMarkdown({ notionClient: notion });

(async () => {
  const mdblocks = await n2m.pageToMarkdown("target_page_id");
  const mdString = n2m.toMarkdownString(mdblocks);

  //writing to file
  fs.writeFile("test.md", mdString, (err) => {
    console.log(err);
  });
})();
```

**Output:**

![output](https://imgur.com/XrUYrZ0.png)

### converting page to markdown object

Example notion page:

![Imgur](https://imgur.com/9iqRpBl.png)

```js
const { Client } = require("@notionhq/client");
const { NotionToMarkdown } = require("notion-to-md");

const notion = new Client({
  auth: "your integration token",
});

// passing notion client to the option
const n2m = new NotionToMarkdown({ notionClient: notion });

(async () => {
  // notice second argument, totalPage.
  const x = await n2m.pageToMarkdown("target_page_id", 2);
  console.log(x);
})();
```

**Output:**

```json
[
  {
    "parent": "# heading 1",
    "children": []
  },
  {
    "parent": "- bullet 1",
    "children": [
      {
        "parent": "- bullet 1.1",
        "children": []
      },
      {
        "parent": "- bullet 1.2",
        "children": []
      }
    ]
  },
  {
    "parent": "- bullet 2",
    "children": []
  },
  {
    "parent": "- [ ] check box 1",
    "children": [
      {
        "parent": "- [x] check box 1.2",
        "children": []
      },
      {
        "parent": "- [ ] check box 1.3",
        "children": []
      }
    ]
  },
  {
    "parent": "- [ ] checkbox 2",
    "children": []
  }
]
```

### converting list of blocks to markdown object

same notion page as before

```js
const { Client } = require("@notionhq/client");
const { NotionToMarkdown } = require("notion-to-md");

const notion = new Client({
  auth: "your integration token",
});

// passing notion client to the option
const n2m = new NotionToMarkdown({ notionClient: notion });

(async () => {
  // get all blocks in the page
  const { results } = await notion.blocks.children.list({
    block_id,
  });

  //convert to markdown
  const x = await n2m.blocksToMarkdown(results);
  console.log(x);
})();
```

**Output**: same as before

### Converting a single block to markdown string

- only takes a single notion block and returns corresponding markdown string
- nesting is ignored
- depends on @notionhq/client

```js
const { NotionToMarkdown } = require("notion-to-md");

// passing notion client to the option
const n2m = new NotionToMarkdown({ notionClient: notion });

const result = n2m.blockToMarkdown(block);
console.log(result);
```

**result**:

```
![image](https://media.giphy.com/media/Ju7l5y9osyymQ/giphy.gif)
```

## Contribution

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)
