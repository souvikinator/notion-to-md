---
title: Media strategy catalogue
description: Explore different strategies for handling media assets in notion-to-md.
weight: 2
---

# Media Strategy Catalogue

Notion-to-md offers several strategies for handling media (images, files, PDFs) found in your Notion pages during conversion. Choose the strategy that best fits your workflow and deployment target.

## Available Strategies

- **[Direct Strategy](../../docs/v4/concepts/configuration/#direct-strategy):** (Default) Uses the original Notion URLs. Simple, but URLs may expire. Supports optional in-memory buffering of media content.
- **[Download Strategy](../../docs/v4/concepts/configuration/#download-strategy):** Downloads media files to a specified local directory. Ideal for static site generators or local hosting.
- **[Upload Strategy](../../docs/v4/concepts/configuration/#upload-strategy):** Uploads media files to an external service (e.g., S3, Cloudinary) via a custom handler. Suitable for cloud-based hosting and CDNs.

See the [Media Handling Configuration](../../docs/v4/concepts/configuration/#media-handling-configuration) documentation for detailed setup instructions for each strategy.

> [!TIP] > **Got suggestions? Feel free to drop your thoughts below in the comments 👇**
