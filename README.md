<img src="https://imgur.com/WgXdz9r.png" />

# Notion to Markdown

Notion Markdown Exporter using **[notion-sdk-js](https://github.com/makenotion/notion-sdk-js)**

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
- [ ] embeds
- [ ] tables
- [ ] videos
- [x] convert returned markdown object to string
- [ ] add tests

## Install

```Bash
$ npm install notion-to-md
```

## Usage

### converting markdown objects to markdown string

This is how the notion page looks for this example:

![Imgur](https://imgur.com/O6bKCmH.png)

```js
const { Client } = require("@notionhq/client");
const notion2md = require("notion-to-md");

const notion = new Client({
  auth: "your integration token",
});

// passing notion client to the option
const n2m = new notion2md({ notionClient: notion });

(async () => {
  const mdblocks = await n2m.pageToMarkdown("target_page_id");
  const mdString = n2m.toString(mdblocks);

  //writing to file
  fs.writeFile("test.md", mdString, (err) => {
    console.log(err);
  });
})();
```

**Output:**

![output](https://imgur.com/XrUYrZ0.png)

### converting page to markdown object

This is how the notion page looks for this example:

![Imgur](https://imgur.com/9iqRpBl.png)

```js
const { Client } = require("@notionhq/client");
const notion2md = require("notion-to-md");

const notion = new Client({
  auth: "your integration token",
});

// passing notion client to the option
const n2m = new notion2md({ notionClient: notion });

(async () => {
  const x = await n2m.pageToMarkdown("target_page_id");
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

> This example blocks from a single page is used. One construct array of blocks from different notion pages and pass in to the `blocksToMarkdown()`

same notion page as before

```js
const { Client } = require("@notionhq/client");
const notion2md = require("notion-to-md");

const notion = new Client({
  auth: "your integration token",
});

// passing notion client to the option
const n2m = new notion2md({ notionClient: notion });

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

- just takes a single notion block and returns corresponding markdown string
- nesting is ignored

```js
const result = n2m.blockToMarkdown(block);
console.log(result);
```

**result**:

```
![image](https://media.giphy.com/media/Ju7l5y9osyymQ/giphy.gif)
```

## API

### `pageToMarkdown(page_id)`

- Takes page_id as input and converts all the blocks in the page to corresponding markdown

### `blockToMarkdown(block)`

- Takes one notion block and converts to markdown
- does not deal with nested notion blocks
- This method doesn't require the `notion-sdk-js`.
- Refer docs to know more about [notion blocks](https://developers.notion.com/reference/block)

### `blocksToMarkdown(blocks)`

> **Note**: requires <u>**notion-sdk-js**</u> unlike `blockToMarkdown`

- `blocks`: array of notion blocks
- deals with <u>**nested blocks**</u>
- uses `blockToMarkdown` internally.

## Contribution

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)
