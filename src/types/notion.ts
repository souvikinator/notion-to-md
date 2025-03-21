import type {
  PageObjectResponse,
  RichTextItemResponse,
  QueryDatabaseParameters,
  BlockObjectResponse,
  DatabaseObjectResponse,
  CommentObjectResponse,
  ChildDatabaseBlockObjectResponse,
} from '@notionhq/client/build/src/api-endpoints';

/**
 * Util type to extract the `type` property from Notion objects.
 */
export type ExtractTypes<T> = T extends { type: infer U } ? U : never;

/**
 * ==========================
 * Notion Database Types
 * ==========================
 */

/** Unique identifier for a Notion database */
export type NotionDatabaseId = string;

/** Query parameters for filtering and retrieving database entries */
export type NotionDatabaseQueryOptions = QueryDatabaseParameters;

/** Represents a Notion database, where the "properties" field contains its content */
export type NotionDatabaseEntry = PageObjectResponse;

/** Represents the properties of a Notion database entry */
export type NotionDatabaseEntryProperties = NotionDatabaseEntry['properties'];

/** Represents a single property within a Notion database entry */
export type NotionDatabaseEntryProperty = NotionDatabaseEntryProperties[string];

/**
 * Extracts all possible Notion database property types.
 *
 * Why from database content instead of schema?
 * Some properties appear in the UI and content response but are missing from the database schema type.
 */
export type NotionDatabasePropertyType =
  ExtractTypes<NotionDatabaseEntryProperty>;

/** Represents the schema of a Notion database, defining all properties */
export type NotionDatabaseSchema = DatabaseObjectResponse;

/** Represents the properties schema of a Notion database */
export type NotionDatabaseSchemaProperties = NotionDatabaseSchema['properties'];

/** Represents a single property within a Notion database schema */
export type NotionDatabaseSchemaProperty =
  NotionDatabaseSchemaProperties[string];

/**
 * extending the child_database{} object inside the block with type: "child_database"
 *
 *  properties: output of the notionSdk.databases.retrieve
 *
 *  children:  output of the notionSdk.databases.query
 */
export type NotionExtendedChildDatabaseObject =
  ChildDatabaseBlockObjectResponse['child_database'] & {
    schema: NotionDatabaseSchema;
    entries: NotionDatabaseEntry[];
  };

/**
 * ==========================
 * Notion Page Types
 * ==========================
 */

/** Represents all properties of a specific Notion page */
export type NotionPageProperties = PageObjectResponse['properties'];

/** Represents a single property within a Notion page */
export type NotionPageProperty = PageObjectResponse['properties'][string];

/** Extracts all possible types of Notion page properties */
export type NotionPagePropertyType = ExtractTypes<NotionPageProperty>;

/**
 * ==========================
 * Notion Comment Types
 * ==========================
 */

/** Represents a single comment in Notion */
export type NotionComment = CommentObjectResponse;

/** Represents a list of comments in Notion */
export type NotionComments = NotionComment[];

/**
 * ==========================
 * Notion Block Types
 * ==========================
 */

/**
 * Represents a single Notion block, which can be a paragraph, heading, list, etc.
 *
 * "comments" property stores comments related to the block. Doesn't exist in the
 * Notion API response, specific to notion-to-md for easier processing
 *
 * "children" property stores child blocks of the block. Doesn't exist in the
 * Notion API response, specific to notion-to-md for easier processing
 */

export type NotionBlock =
  // For blocks that are NOT child_database
  | (Exclude<BlockObjectResponse, ChildDatabaseBlockObjectResponse> & {
      comments: NotionComments;
      children: NotionBlocks;
    })
  // For blocks that ARE child_database, extend the child_database property.
  | (ChildDatabaseBlockObjectResponse & {
      comments: NotionComments;
      children: NotionBlocks;
      child_database: NotionExtendedChildDatabaseObject;
    });

/** Represents an array of Notion blocks, allowing partial properties */
export type NotionBlocks = NotionBlock[];

/** Extracts all possible block types in Notion */
export type NotionBlockType = NotionBlock['type'];

/**
 * Represents the metadata of a Notion database, containing information about the database.
 *
 * {
 *  properties: NotionDatabaseProperties; // output of the notionSdk.databases.retrieve
 *  content: NotionDatabaseContent[]; // output of the notionSdk.databases.query
 * }
 */

/**
 * ==========================
 * Notion Rich Text & Annotations
 * ==========================
 */

/** Represents a single rich text item in Notion */
export type NotionRichTextItem = RichTextItemResponse;
/** Represents text styling annotations like bold, italic, underline, etc. */
export type NotionRichTextAnnotation = NotionRichTextItem['annotations'];

/** List of supported annotation types in Notion rich text */
export type NotionAnnotationType =
  | 'bold'
  | 'italic'
  | 'strikethrough'
  | 'code'
  | 'underline'
  | 'link' // Added for easier processing, not in the official API
  | 'equation' // Added for easier processing, not in the official API
  | (string & {});

/**
 * ==========================
 * General Types (Not Specific to Notion)
 * ==========================
 */

/** Maps database IDs to their corresponding query parameters */
export type NotionDatabaseQueryMapping = Record<
  NotionDatabaseId,
  NotionDatabaseQueryOptions
>;
