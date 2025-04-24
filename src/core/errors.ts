/**
 * Specific error for when manifest management fails
 */
export class ManifestNotInitializedError extends Error {
  constructor(moduleType: string) {
    super(
      `Manifest manager not initialized for ${moduleType}. Call setManifestManager before accessing manifest.`,
    );
    this.name = 'ManifestNotInitializedError';
  }
}

export class MediaHandlerError extends Error {
  constructor(
    message: string,
    public cause?: Error,
  ) {
    super(message);
    this.name = 'MediaHandlerError';
  }
}

/**
 * Specific error class for page reference handling errors
 */
export class PageReferenceHandlerError extends Error {
  constructor(
    message: string,
    public cause?: Error,
  ) {
    super(message);
    this.name = 'PageReferenceHandlerError';
  }
}
