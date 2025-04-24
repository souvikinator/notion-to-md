export class ManifestError extends Error {
  constructor(
    message: string,
    public cause?: Error,
  ) {
    super(message);
    this.name = "ManifestError";
  }
}

export class ManifestIOError extends ManifestError {
  constructor(operation: string, path: string, cause?: Error) {
    super(`Failed to ${operation} manifest at ${path}`, cause);
    this.name = "ManifestIOError";
  }
}

export class ManifestNotFoundError extends ManifestError {
  constructor(path: string) {
    super(`Manifest not found at ${path}`);
    this.name = "ManifestNotFoundError";
  }
}

export class ManifestNotInitializedError extends ManifestError {
  constructor() {
    super("Manifest not initialized. Call initializeForPage first.");
    this.name = "ManifestNotInitializedError";
  }
}

export class MediaManifestError extends ManifestError {
  constructor(
    message: string,
    public cause?: Error,
  ) {
    super(message);
    this.name = "MediaManifestError";
  }
}

export class MediaEntryNotFoundError extends MediaManifestError {
  constructor(blockId: string) {
    super(`Media entry not found for block: ${blockId}`);
    this.name = "MediaEntryNotFoundError";
  }
}

export class MediaManifestStateError extends MediaManifestError {
  constructor(message: string) {
    super(message);
    this.name = "MediaManifestStateError";
  }
}

export class PageReferenceError extends ManifestError {
  constructor(
    message: string,
    public cause?: Error,
  ) {
    super(message);
    this.name = "PageReferenceError";
  }
}

export class PageReferenceNotFoundError extends PageReferenceError {
  constructor(pageId: string) {
    super(`Page reference not found for page: ${pageId}`);
    this.name = "PageReferenceNotFoundError";
  }
}

export class PageReferenceStateError extends PageReferenceError {
  constructor(message: string) {
    super(message);
    this.name = "PageReferenceStateError";
  }
}
