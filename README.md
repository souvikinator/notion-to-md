<img src="https://imgur.com/WgXdz9r.png" />

# Notion to Markdown

Convert notion pages, block and list of blocks to markdown (supports nesting) using **[notion-sdk-js](https://github.com/makenotion/notion-sdk-js)**

> **Note:** Before getting started, create [an integration and find the token](https://www.notion.so/my-integrations).

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
- [ ] tables
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
- independent of @notionhq/client

```js
const { NotionToMarkdown } = require("notion-to-md");

// notion client not required
const n2m = new NotionToMarkdown();

const result = n2m.blockToMarkdown(block);
console.log(result);
```

**result**:

```
![image](https://media.giphy.com/media/Ju7l5y9osyymQ/giphy.gif)
```

## API

> ### `toMarkdownString(mdBlock[])`
>
> - takes output of `pageToMarkdown` or `blocksToMarkdown` as argument
> - converts to markdown string.

> ### `pageToMarkdown(id,totalPage)`
>
> - Uses `blocksToMarkdown` internally.
> - `id`(pageid) as input and converts all the blocks in the page to corresponding markdown object
> - `totalPage` is the retrieve block children request number i.e `page_size Maximum = totalPage * 100`.

> ### totalPage
>
> Default value is `1` which means only `100` blocks will be converted to markdown and rest will be ignored (due to notion api limitations, ref: [#9](https://github.com/souvikinator/notion-to-md/pull/9)).
>
> ### How to use `totalPage` arg ?
>
> - if the notion page contains less than or equal `100` blocks then `totalPage` arg is not required.
> - if the notion page contains `150` blocks then `totalPage` argument should be greater than or equal to `2` leading to `pageSize = 2 * 100` and rendering all `150` blocks.

> ### `blocksToMarkdown(blocks,totalPage)`
>
> **Note**: requires <u>**notion-sdk-js**</u> unlike `blockToMarkdown`
>
> - `blocks`: array of notion blocks
> - `totalPage`: the retrieve block children request number i.e `page_size Maximum = totalPage * 100`.
> - deals with <u>**nested blocks**</u>
> - uses `blockToMarkdown` internally.

> ### `blockToMarkdown(block)`
>
> - Takes single notion block and converts to markdown string
> - does not deal with nested notion blocks
> - This method doesn't require the `notion-sdk-js`.
> - Refer docs to know more about [notion blocks](https://developers.notion.com/reference/block)

## Contribution

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)
