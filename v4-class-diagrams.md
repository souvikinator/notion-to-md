# Class architecture

## Birds eye view

```mermaid
classDiagram
    class NotionConverter {
        %% Core Dependencies
        -client: Client
        -manifestManager: ManifestManager
        -blockFetcher: BlockFetcher
        -mediaHandler: MediaHandler|null
        -pageReferenceHandler: PageReferenceHandler
        -renderer: RendererPlugin
        
        %% Configuration
        -config: NotionConverterConfig
        -outputPath: string
        -mediaConfig: MediaConfig|null
        
        %% Constructor
        +constructor(client: Client, config?: NotionConverterConfig)
        
        %% Builder Methods
        +setOutputPath(path: string): this
        +downloadMediaTo(config: DownloadConfig): this
        +uploadMediaUsing(config: UploadConfig): this
        +withPageReferences(config: PageRefConfig): this
        +withRenderer(renderer: RendererPlugin): this
        
        %% Core Operation
        +convert(pageId: string): Promise~ConversionResult~
        
        %% Private Methods
        -initializeModules(pageId: string): Promise~void~
        -validateConfiguration(): void
        -createMediaStrategy(): MediaStrategy
        -handleConversionError(error: Error): ConversionError
    }

    %% Core Modules
    class BlockFetcher {
        -client: Client
        -config: BlockFetcherConfig
        +getBlocks(pageId: string): Promise~FetcherOutput~
    }

    class MediaHandler {
        -strategy: MediaStrategy
        +processBlocks(blocks: Block[]): Promise~void~
    }

    class PageReferenceHandler {
        -config: PageRefConfig
        +processBlocks(blocks: Block[]): Promise~void~
    }

    class RendererPlugin {
        +render(blocks: Block[]): Promise~string~
    }

    %% Configuration Types
    class NotionConverterConfig {
        +outputPath?: string
        +defaultRenderer?: RendererPlugin
        +blockFetcherConfig?: BlockFetcherConfig
        +pageReferenceConfig?: PageRefConfig
        +validateConfig?: boolean
        +debug?: boolean
    }

    class BlockFetcherConfig {
        +fetchPageProperties?: boolean
        +fetchComments?: boolean
        +maxRequestsPerSecond?: number
        +batchSize?: number
    }

    class PageRefConfig {
        +baseUrl: string
        +transformUrl?: Function
        +shouldIncludePrivate?: boolean
        +pageMapping?: Record~string, string~
    }

    class MediaConfig {
        +type: "download" | "upload"
        +config: DownloadConfig | UploadConfig
    }

    %% Output Types
    class ConversionResult {
        +content: string
        +mediaFiles?: string[]
        +referencedPages?: string[]
        +metadata?: Record~string, any~
        +errors?: ConversionError[]
    }

    %% Manifest Management
    class ManifestManager {
        +initialize(): Promise~void~
        +getMediaManifest(): MediaManifestManager
        +getPageRefManifest(): PageReferenceManifestManager
    }

    %% External Dependencies
    class Client {
        <<external>>
    }

    %% Relationships
    NotionConverter *-- BlockFetcher
    NotionConverter *-- ManifestManager
    NotionConverter o-- MediaHandler
    NotionConverter *-- PageReferenceHandler
    NotionConverter *-- RendererPlugin
    NotionConverter --> Client : uses
    NotionConverter --> NotionConverterConfig : configured by
    NotionConverter --> ConversionResult : produces
    
    BlockFetcher --> BlockFetcherConfig : configured by
    MediaHandler --> MediaConfig : configured by
    PageReferenceHandler --> PageRefConfig : configured by
```

## Manifest manager

```mermaid
classDiagram
    class BaseManifestManager {
        %% Constants and Common Properties
        #readonly BASE_DIR: string
        
        %% Constructor
        +constructor(baseDir?: string)
        
        %% Core Directory Operations
        #ensureDirectories(): Promise~void~
        #getManifestPath(id: string): string
        
        %% Base Manifest Operations
        #loadManifest(path: string): Promise~any~
        #saveManifest(path: string, data: any): Promise~void~
        #validateManifest(data: any): boolean
        
        %% Error Handling
        #handleFileError(error: Error): void
        #handleValidationError(error: Error): void
        
        %% Abstract Methods
        +initialize(): Promise~void~
        +save(): Promise~void~
    }
    
    class MediaManifestManager {
        %% Properties
        -mediaDir: string
        -currentPageId: string
        
        %% Media Specific Methods
        +initializeForPage(pageId: string): Promise~void~
        +updateMediaEntry(blockId: string, entry: MediaEntry): void
        +getMediaEntry(blockId: string): MediaEntry|undefined
        +removeMediaEntry(blockId: string): void
        +getAllMediaEntries(): Record~string, MediaEntry~
        +getOrphanedMedia(currentBlockIds: Set~string~): MediaEntry[]
        
        %% Override Methods
        +initialize(): Promise~void~
        +save(): Promise~void~
        
        %% Helper Methods
        -validateMediaEntry(entry: MediaEntry): boolean
        -cleanupOrphanedEntries(): Promise~void~
    }
    
    class PageReferenceManifestManager {
        %% Properties
        -pageRefDir: string
        -globalManifestName: string
        
        %% Page Reference Specific Methods
        +updatePageReference(pageId: string, url: string): void
        +getPageReference(pageId: string): string|undefined
        +getAllPageReferences(): Record~string, string~
        +removePageReference(pageId: string): void
        +bulkUpdateReferences(mappings: Record~string, string~): void
        
        %% Override Methods
        +initialize(): Promise~void~
        +save(): Promise~void~
        
        %% Helper Methods
        -validatePageReference(pageId: string, url: string): boolean
        -normalizeUrl(url: string): string
    }
    
    BaseManifestManager <|-- MediaManifestManager : extends
    BaseManifestManager <|-- PageReferenceManifestManager : extends
```

## Modules

### Base module

All core modules inherit this class, kind of like orchestrator class for all the core modules

```mermaid
classDiagram
    class BaseModule {
        #mediaManifest: MediaManifestManager|null
        #pageRefManifest: PageReferenceManifestManager|null
        +setManifestManagers(media: MediaManifestManager, pageRef: PageReferenceManifestManager)
        #getMediaManifest(): MediaManifestManager
        #getPageRefManifest(): PageReferenceManifestManager
        #validateManifestAccess(): void
    }
    
    class BlockFetcher {
        -client: Client
        -config: BlockFetcherConfig
        +getBlocks(pageId: string): Promise~FetcherOutput~
    }
    
    class MediaHandler {
        -strategy: MediaStrategy
        +processBlocks(blocks: Block[]): Promise~void~
    }
    
    class PageReferenceHandler {
        -config: PageRefConfig
        +processBlocks(blocks: Block[]): Promise~void~
    }
    
    class RendererPlugin {
        +render(blocks: Block[]): Promise~string~
    }
    
    class BaseManifestManager {
        <<abstract>>
        +initialize(): Promise~void~
        +save(): Promise~void~
    }
    
    class MediaManifestManager {
        +initializeForPage(pageId: string): Promise~void~
        +updateMediaEntry(blockId: string, entry: MediaEntry): void
    }
    
    class PageReferenceManifestManager {
        +updatePageReference(pageId: string, url: string): void
        +getAllPageReferences(): Record~string, string~
    }
    
    %% Inheritance Relationships
    BaseModule <|-- BlockFetcher
    BaseModule <|-- MediaHandler
    BaseModule <|-- PageReferenceHandler
    BaseModule <|-- RendererPlugin
    BaseManifestManager <|-- MediaManifestManager
    BaseManifestManager <|-- PageReferenceManifestManager
    
    %% Usage Relationships
    BaseModule o-- MediaManifestManager : uses
    BaseModule o-- PageReferenceManifestManager : uses
    
    %% Styling
    class BaseModule {
        <<abstract>>
    }
    class BaseManifestManager {
        <<abstract>>
    }
```

### Blocks Fetcher

```mermaid
classDiagram
    %% Base Module Inheritance
    class BaseModule {
        #mediaManifest: MediaManifestManager|null
        #pageRefManifest: PageReferenceManifestManager|null
        +setManifestManagers(media: MediaManifestManager, pageRef: PageReferenceManifestManager)
    }

    %% Block Fetcher Main Class
    class BlockFetcher {
        %% Private Properties
        -client: Client
        -config: BlockFetcherConfig
        -queue: QueueTask[]
        -blocks: Map~string, ListBlockChildrenResponseResult~
        -processedTasks: Set~string~
        -pageProperties: PageObjectProperties
        -rootComments: CommentResponseResults
        -rootBlockId: string
        -rateLimitWindow: RateLimitState

        %% Constructor
        +constructor(client: Client, config?: BlockFetcherConfig)

        %% Public Methods
        +getBlocks(pageId: string): Promise~FetcherOutput~

        %% Private Methods
        -addTask(task: QueueTask): void
        -processTask(task: QueueTask): Promise~void~
        -rateLimitRequest~T~(request: () => Promise~T~): Promise~T~
        -fetchBlockChildren(blockId: string): Promise~ListBlockChildrenResponseResults~
        -fetchAllComments(blockId: string): Promise~CommentResponseResults~
        -fetchPageProperties(pageId: string): Promise~PageObjectProperties~
        -normalizeId(id: string): string
        -buildBlockTree(rootId: string): ListBlockChildrenResponseResults
    }

    %% Configuration Interfaces
    class BlockFetcherConfig {
        +fetchPageProperties?: boolean
        +fetchComments?: boolean
        +maxRequestsPerSecond?: number
        +batchSize?: number
    }

    class QueueTask {
        +type: "fetch_properties" | "fetch_comments" | "fetch_blocks"
        +id: string
        +parentId?: string
    }

    class RateLimitState {
        +requests: number
        +startTime: number
    }

    class FetcherOutput {
        +properties: PageObjectProperties
        +comments: CommentResponseResults
        +blocks: ListBlockChildrenResponseResults
    }

    %% External Dependencies
    class Client {
        <<external>>
        +blocks: BlocksClient
        +comments: CommentsClient
        +pages: PagesClient
    }

    %% Relationships
    BaseModule <|-- BlockFetcher : extends
    BlockFetcher *-- BlockFetcherConfig : configured by
    BlockFetcher *-- QueueTask : manages
    BlockFetcher *-- RateLimitState : tracks
    BlockFetcher --> FetcherOutput : produces
    BlockFetcher --> Client : uses

    %% Additional Type Notes
    class Note1["Note: Default Config Values"] {
        <<note>>
        fetchPageProperties: false
        fetchComments: false
        maxRequestsPerSecond: 3
        batchSize: 3
    }

    class Note2["Note: Rate Limiting"] {
        <<note>>
        Window Size: 1000ms
        Resets when window expires
        Waits if limit reached
    }

    BlockFetcherConfig .. Note1
    RateLimitState .. Note2
```

### Media Strategy (used by Media Handler)

```mermaid
classDiagram
    %% Base Strategy Interface
    class MediaStrategy {
        <<interface>>
        +process(block: Block): Promise~MediaInfo~
        +transform(mediaInfo: MediaInfo): string
        +cleanup(entry: MediaManifestEntry): Promise~void~
    }

    %% Download Strategy Implementation
    class DownloadStrategy {
        -config: DownloadConfig
        +constructor(config: DownloadConfig)
        +process(block: Block): Promise~MediaInfo~
        +transform(mediaInfo: MediaInfo): string
        +cleanup(entry: MediaManifestEntry): Promise~void~
        -downloadFile(url: string, blockId: string): Promise~FileInfo~
        -extractMediaUrl(block: Block): string
        -ensureOutputDirectory(): Promise~void~
        -generateFilename(blockId: string, mimeType: string): string
    }

    %% Upload Strategy Implementation
    class UploadStrategy {
        -config: UploadConfig
        +constructor(config: UploadConfig)
        +process(block: Block): Promise~MediaInfo~
        +transform(mediaInfo: MediaInfo): string
        +cleanup(entry: MediaManifestEntry): Promise~void~
        -extractMediaUrl(block: Block): string
        -validateUploadResponse(url: string): void
        -isNotionUrl(url: string): boolean
    }

    %% Configuration Interfaces
    class DownloadConfig {
        +outputPath: string
        +transformPath?(localPath: string): string
        +preserveExternalUrls?: boolean
    }

    class UploadConfig {
        +uploadHandler(url: string, blockId: string): Promise~string~
        +cleanupHandler?(entry: MediaManifestEntry): Promise~void~
        +transformPath?(uploadedUrl: string): string
        +preserveExternalUrls?: boolean
    }

    %% Media Information Types
    class MediaInfo {
        +type: MediaInfoType
        +originalUrl: string
        +transformedUrl: string
        +localPath?: string
        +uploadedUrl?: string
        +mimeType?: string
    }

    class MediaInfoType {
        <<enumeration>>
        DOWNLOAD
        UPLOAD
        DIRECT
    }

    class FileInfo {
        +localPath: string
        +mimeType: string
    }

    %% Error Types
    class MediaProcessingError {
        +message: string
        +blockId: string
        +operation: string
        +details: string
        +constructor(message: string, blockId: string, operation: string, details: any)
    }

    %% Relationships
    MediaStrategy <|.. DownloadStrategy : implements
    MediaStrategy <|.. UploadStrategy : implements
    DownloadStrategy --> DownloadConfig : uses
    UploadStrategy --> UploadConfig : uses
    MediaStrategy --> MediaInfo : produces
    MediaInfo --> MediaInfoType : uses
    DownloadStrategy --> FileInfo : produces
    MediaStrategy --> MediaProcessingError : throws
```

### Media Handler (inclues Media strategy)

```mermaid
classDiagram
    %% Base Module Inheritance
    class BaseModule {
        #mediaManifest: MediaManifestManager
        #pageRefManifest: PageReferenceManifestManager
        +setManifestManagers(media: MediaManifestManager, pageRef: PageReferenceManifestManager)
    }

    %% Media Handler Main Class
    class MediaHandler {
        -strategy: MediaStrategy
        -processedBlockIds: Set~string~
        -entriesToCleanup: MediaManifestEntry[]

        %% Constructor
        +constructor(strategy: MediaStrategy)
        
        %% Public Methods
        +processBlocks(blocks: Block[]): Promise~void~
        
        %% Private Processing Methods
        -processBlockArray(blocks: Block[]): Promise~void~
        -processMediaBlock(block: Block): Promise~void~
        -hasMedia(block: Block): boolean
        -handleCleanup(): Promise~void~
        
        %% Error Handling
        -handleProcessingError(error: Error, block: Block): void
        -handleCleanupError(error: Error, entry: MediaManifestEntry): void
    }

    %% Media Manifest Entry
    class MediaManifestEntry {
        +blockId: string
        +lastEdited: string
        +mediaInfo: MediaInfo
        +createdAt: string
        +updatedAt: string
    }

    %% Block Processing Types
    class Block {
        +id: string
        +type: string
        +has_children: boolean
        +children?: Block[]
    }

    class MediaBlock {
        +type: "image" | "video" | "file" | "pdf"
        +id: string
        +file?: FileObject
        +external?: ExternalObject
    }

    %% Strategy Interface (simplified)
    class MediaStrategy {
        <<interface>>
        +process(block: Block): Promise~MediaInfo~
        +transform(mediaInfo: MediaInfo): string
        +cleanup(entry: MediaManifestEntry): Promise~void~
    }

    %% Relationships
    BaseModule <|-- MediaHandler : extends
    MediaHandler *-- MediaStrategy : uses
    MediaHandler --> MediaManifestEntry : manages
    MediaHandler --> Block : processes
    Block <|-- MediaBlock : extends
    MediaHandler --> MediaProcessingError : throws
    MediaStrategy --> MediaInfo : produces
```

### Page reference handler module

```mermaid
classDiagram
    %% Base Module Inheritance
    class BaseModule {
        #mediaManifest: MediaManifestManager|null
        #pageRefManifest: PageReferenceManifestManager|null
        +setManifestManagers(media: MediaManifestManager, pageRef: PageReferenceManifestManager)
    }

    %% Page Reference Handler Main Class
    class PageReferenceHandler {
        %% Private Properties
        -config: PageReferenceConfig
        -processedPages: Set~string~
        -currentPageId: string
        -pageReferences: Map~string, PageReferenceInfo~
        
        %% Constructor
        +constructor(config: PageReferenceConfig)
        
        %% Public Methods
        +processBlocks(blocks: Block[]): Promise~void~
        +getPageReferences(): PageReferenceInfo[]
        
        %% Private Methods
        -processBlockArray(blocks: Block[]): Promise~void~
        -processPageReference(block: Block): Promise~void~
        -validatePageAccess(pageId: string): Promise~boolean~
        -transformPageUrl(pageId: string): string
        -extractPageReferences(block: Block): PageReference[]
        -handlePrivatePageReference(pageId: string): void
    }

    %% Configuration
    class PageReferenceConfig {
        +baseUrl: string
        +transformUrl?(url: string): string
        +shouldIncludePrivate?: boolean
        +pageMapping?: Record~string, string~
        +urlStyle?: "relative" | "absolute"
        +pathPrefix?: string
    }

    %% Reference Types
    class PageReferenceInfo {
        +sourcePageId: string
        +targetPageId: string
        +originalUrl: string
        +transformedUrl: string
        +isAccessible: boolean
        +referenceType: ReferenceType
    }

    class PageReference {
        +pageId: string
        +type: ReferenceType
        +context: ReferenceContext
    }

    class ReferenceType {
        <<enumeration>>
        DIRECT_LINK
        CHILD_PAGE
        PAGE_MENTION
        DATABASE_MENTION
    }

    class ReferenceContext {
        +blockId: string
        +parentBlockId?: string
        +mentionType?: string
    }

    %% Error Types
    class PageReferenceError {
        +message: string
        +pageId: string
        +operation: string
        +details: string
        +constructor(message: string, pageId: string, operation: string, details: any)
    }

    %% Relationships
    BaseModule <|-- PageReferenceHandler : extends
    PageReferenceHandler *-- PageReferenceConfig : configured by
    PageReferenceHandler --> PageReferenceInfo : produces
    PageReferenceHandler --> PageReference : processes
    PageReference --> ReferenceType : uses
    PageReference --> ReferenceContext : contains
    PageReferenceHandler --> PageReferenceError : throws
    
    %% Processing States
    class ProcessingState {
        <<note>>
        1. Extract References
        2. Validate Access
        3. Transform URLs
        4. Update Manifest
    }
```
