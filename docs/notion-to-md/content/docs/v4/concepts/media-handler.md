---
title: "Media Handling"
description: "Learn how to process images and files from Notion pages"
weight: 2
---

When converting Notion pages to Markdown, handling media files (images, videos, PDFs, etc.) is essential. [notion-to-md v4](https://github.com/souvikinator/notion-to-md) provides powerful media handling capabilities that solve several key challenges.

## Why Media Handling Matters

Notion stores media files on temporary URLs that expire after a short period. When you convert Notion content to Markdown, you need a solution for these media references:

1. **Permanence** - Notion's media URLs expire which fails to work for static content.
2. **Ownership** - You might want to host media files yourself rather than relying on Notion
3. **Optimization** - You may need to process images (resize, compress, format conversion)

## Media Handler Strategies

Notion-to-md v4 offers three strategies for handling media, each tailored to different needs:

- **Direct Strategy**: Uses Notion's URLs directly—ideal for temporary exports or testing, though it’s the least reliable option.
- **Download Strategy**: Downloads media files to your local filesystem, making it perfect for static sites, local applications, or scenarios where you need complete control.
- **Upload Strategy**: Uploads media files to an external service (like S3 or Cloudinary), and is best suited for production websites, CMS integration, or cloud-based workflows.

{{< callout type="info" >}}
**Download** and **Upload** strategies also include **cleanup functionality** to remove unused media files. This ensures that your media storage remains organized and free from unnecessary files.
{{< /callout >}}

## Using the Download Strategy

The Download Strategy downloads media files from Notion and saves them to a local directory.

{{< callout type="info" >}}
Detailed configuration options for the **Download strategy** are available in the [Configuration Guide](../configuration/#download-strategy).
{{< /callout >}}

### Basic Configuration

```javascript
import { NotionConverter } from 'notion-to-md';
import * as path from 'path';

const n2m = new NotionConverter(notionClient)
  .downloadMediaTo({
    outputDir: './public/images',
    transformPath: (localPath) => `/images/${path.basename(localPath)}`
  });

await n2m.convert('your-page-id');
```

### How It Works

1. The media handler identifies all media blocks in the Notion content
2. For each media block:
   - The file is downloaded from Notion
   - The content type is detected
   - The file is saved to the specified directory
   - The URL in the block is updated to reference the new location

### Path Transformation

The `transformPath` function controls how local file paths are converted to URLs in your output. This is important for ensuring your content correctly references the media files.

```javascript
// Example: Convert local server path to a web URL
.downloadMediaTo({
  outputDir: './public/images',
  transformPath: (localPath) => {
    // Extract just the filename from the full path
    const filename = path.basename(localPath);
    // Return a web-accessible URL
    return `/images/${filename}`;
  }
})
```

Without transformation, the paths in your content would point to server-side locations that aren't accessible via a web browser.

## Using the Upload Strategy

The Upload Strategy uploads media files to an external service like AWS S3, Cloudinary, or any custom storage system.

{{< callout type="info" >}}
Detailed configuration options for the **Upload strategy** are available in the [Configuration Guide](../configuration/#upload-strategy).
{{< /callout >}}

### Basic Configuration

```javascript
import { NotionConverter } from 'notion-to-md';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fetch from 'node-fetch';

// Initialize S3 client
const s3Client = new S3Client({ region: 'us-east-1' });
const BUCKET_NAME = 'my-notion-media';

const n2m = new NotionConverter(notionClient)
  .uploadMediaUsing({
    // Upload handler function
    uploadHandler: async (url, blockId) => {
      // Download the file from Notion
      const response = await fetch(url);
      const buffer = await response.arrayBuffer();

      // Generate a filename based on the block ID
      const filename = `${blockId}.jpg`;
      const key = `notion-media/${filename}`;

      // Upload to S3
      await s3Client.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: Buffer.from(buffer),
        ContentType: response.headers.get('content-type')
      }));

      // Return the new URL
      return `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;
    },

    // Optional: cleanup handler to delete files when no longer needed
    cleanupHandler: async (entry) => {
      // Extract the key from the URL
      const url = new URL(entry.mediaInfo.uploadedUrl);
      const key = url.pathname.substring(1); // Remove leading slash

      // Delete from S3
      await s3Client.send(new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key
      }));
    }
  });

await n2m.convert('your-page-id');
```

### How It Works

1. The media handler identifies all media blocks in the Notion content
2. For each media block:
   - The `uploadHandler` is called with the original URL and block ID
   - Your handler downloads and uploads the file to your preferred destination
   - Your handler returns the new permanent URL
   - The URL in the block is updated to reference the new location

### Fail Forward

Both strategies include the `failForward` option. If set to `true`, the media handler will continue processing despite errors, falling back to the original URL in case of issues. This is useful when you want to ensure that the conversion process doesn't fail due to temporary issues with your media service.

### Cleanup Process

The cleanup handler is an important feature that prevents accumulating unused media files. It's called in these situations:

1. When a block containing media is removed from the Notion page
2. When a media file in a block is replaced with a different file

This ensures your storage doesn't accumulate orphaned media files over time.

## Using External Media Services

You can integrate with popular media services for more advanced features:

### Cloudinary Example

```javascript
import { NotionConverter } from 'notion-to-md';
import { v2 as cloudinary } from 'cloudinary';
import fetch from 'node-fetch';

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'your-cloud-name',
  api_key: 'your-api-key',
  api_secret: 'your-api-secret'
});

const n2m = new NotionConverter(notionClient)
  .uploadMediaUsing({
    uploadHandler: async (url, blockId) => {
      // Upload directly from URL to Cloudinary
      const result = await cloudinary.uploader.upload(url, {
        folder: 'notion-content',
        public_id: blockId,
        overwrite: true
      });

      // Return optimized URL
      return result.secure_url;
    },

    cleanupHandler: async (entry) => {
      // Extract public_id from the URL
      const urlParts = entry.mediaInfo.uploadedUrl.split('/');
      const publicId = urlParts[urlParts.length - 1].split('.')[0];

      // Delete from Cloudinary
      await cloudinary.uploader.destroy(`notion-content/${publicId}`);
    }
  });
```

## Preserving External URLs

In some cases, you might want to download or upload media from Notion but leave external media URLs (like YouTube embeds or third-party images) unchanged. Use the `preserveExternalUrls` option:

```javascript
.downloadMediaTo({
  outputDir: './public/images',
  transformPath: (localPath) => `/images/${path.basename(localPath)}`,
  preserveExternalUrls: true  // Don't download external media
})
```

## Media Manifest Management

notion-to-md v4 maintains a media manifest that tracks all processed media files. This enables:

1. **Performance Optimization** - Skip re-downloading unchanged files
2. **Cleanups** - Remove files no longer referenced in content
3. **Traceability** - Track the relationship between Notion blocks and media files

The manifest is stored by default in `.notion-to-md/media/{page-id}_media.json` and is managed automatically.

## Troubleshooting

### Common Issues

- **Missing media**: Check if the media exists in the Notion page and is accessible
- **Permission errors**: Ensure your application has write access to the output directory
- **API limits**: Notion or your upload service might have rate limits

### Debugging

If you encounter issues with media handling, you can:

1. Check the manifest file to see what media files have been processed
2. Use the `failForward` (default `true`) option to continue processing despite errors, it'll fallback to the original URL in case of errors.
3. Implement detailed logging in your upload/download handlers
