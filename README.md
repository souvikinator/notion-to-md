

<!-- 
💡 For better readability and detailed instructions head over to the [wiki](https://github.com/souvikinator/notion-to-md/wiki). 
-->
<h1 align="center">
  <br>
<img src="https://imgur.com/WgXdz9r.png" alt="notion-to-md banner"  width="750" />
  <br>
  <b>Notion-to-MD</b>
  <br>
  <sub><sup><b>(Notion to Markdown)</b></sup></sub>
  <br>
</h1>

<p align="center">
       Notion-to-MD is a Node.js package that allows you to convert Notion pages to Markdown format. 
</p>
<p align="center">
  Convert notion pages, blocks and list of blocks to markdown (supports nesting) using <a href="https://github.com/makenotion/notion-sdk-js">notion-sdk-js</a>
</p>
<p align="center">
        <img src="https://img.shields.io/github/stars/souvikinator/notion-to-md?style=for-the-badge"
            alt="">
    <a href="https://www.producthunt.com/products/notion-to-md?utm_source=badge-follow&utm_medium=badge&utm_souce=badge-notion&#0045;to&#0045;md" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/follow.svg?product_id=486574&theme=light&size=small" alt="notion&#0045;to&#0045;md - Programmatically&#0032;convert&#0032;notion&#0032;pages&#0032;to&#0032;markdown | Product Hunt" style="width: 86px; height: 32px;" width="86" height="32" /></a>

</p>




## Install

```Bash
npm install notion-to-md
```

## Usage
> ⚠️ **Note:** Before getting started, create [an integration and find the token](https://www.notion.so/my-integrations).
>  Details on methods can be found in [API section](https://github.com/souvikinator/notion-to-md#api)

> ⚠️ **Note:** Starting from v2.7.0, `toMarkdownString` no longer automatically saves child pages. 
> Now it provides an object containing the markdown content of child pages.

## converting markdown objects to markdown string

This is how the notion page looks for this example:

<img src="https://imgur.com/O6bKCmH.png"  width="500"  />

```javascript
const { Client } = require("@notionhq/client");
const { NotionToMarkdown } = require("notion-to-md");
const fs = require('fs');
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
  console.log(mdString.parent);
})();
```
<img src="https://imgur.com/XrUYrZ0.png"  width="500"  />

## Separate child page content

**parent page content:**

<img src="https://github.com/souvikinator/notion-to-md/assets/64456160/531ef45d-2dc7-47f4-bbb3-12d6fd44d299" width="500" />

**child page content:**

<img src="https://github.com/souvikinator/notion-to-md/assets/64456160/7dde090b-7333-46f8-b6df-e6c9a7b62fa9" width="500" />

`NotionToMarkdown` takes second argument, `config`

```javascript
const { Client } = require("@notionhq/client");
const { NotionToMarkdown } = require("notion-to-md");
const fs = require('fs');
// or
// import {NotionToMarkdown} from "notion-to-md";

const notion = new Client({
  auth: "your integration token",
  config:{
     separateChildPage:true, // default: false
  }
});

// passing notion client to the option
const n2m = new NotionToMarkdown({ notionClient: notion });

(async () => {
  const mdblocks = await n2m.pageToMarkdown("target_page_id");
  const mdString = n2m.toMarkdownString(mdblocks);
  
  console.log(mdString);
})();
```

**Output:**

`toMarkdownString` returns an object with target page content corresponding to `parent` property and if any child page exists then it's included in the same object.

<img src="https://github.com/souvikinator/notion-to-md/assets/64456160/99bcc14e-46e6-4bed-912d-8b9300c214c1" width="500" />

User gets to save the content separately.

## converting page to markdown object

**Example notion page:**

<img src="https://imgur.com/9iqRpBl.png"  width="500"  />

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

## converting list of blocks to markdown object

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

## Converting a single block to markdown string

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

## Custom Transformers

You can define your own custom transformer for a notion type, to parse and return your own string.
`setCustomTransformer(type, func)` will overload the parsing for the giving type.

```ts
const { NotionToMarkdown } = require("notion-to-md");
const n2m = new NotionToMarkdown({ notionClient: notion });
n2m.setCustomTransformer("embed", async (block) => {
  const { embed } = block as any;
  if (!embed?.url) return "";
  return `<figure>
  <iframe src="${embed?.url}"></iframe>
  <figcaption>${await n2m.blockToMarkdown(embed?.caption)}</figcaption>
</figure>`;
});
const result = n2m.blockToMarkdown(block);
// Result will now parse the `embed` type with your custom function.
```

**Note** Be aware that `setCustomTransformer` will take only the last function for the given type. You can't set two different transforms for the same type.

You can also use the default parsing by returning `false` in your custom transformer.

```ts
// ...
n2m.setCustomTransformer("embed", async (block) => {
  const { embed } = block as any;
  if (embed?.url?.includes("myspecialurl.com")) {
    return `...`; // some special rendering
  }
  return false; // use default behavior
});
const result = n2m.blockToMarkdown(block);
// Result will now only use custom parser if the embed url matches a specific url
```

## Contribution

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
Please make sure to update tests as appropriate.

## Contributers

<a href="https://github.com/souvikinator/notion-to-md/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=souvikinator/notion-to-md" />
</a>

## License

[MIT](https://choosealicense.com/licenses/mit/)
