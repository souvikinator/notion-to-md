/**
 * Base error class for manifest-related errors in the system
 */
export class BaseModuleError extends Error {
  constructor(
    message: string,
    public moduleType: string,
    public cause?: Error,
  ) {
    super(message);
    this.name = "BaseModuleError";
  }
}

/**
 * Specific error for when manifest management fails
 */
export class ManifestNotInitializedError extends BaseModuleError {
  constructor(moduleType: string) {
    super(
      `Manifest manager not initialized for ${moduleType}. Call setManifestManager before accessing manifest.`,
      moduleType,
    );
    this.name = "ManifestNotInitializedError";
  }
}

export class MediaHandlerError extends BaseModuleError {
  constructor(message: string, cause?: Error) {
    super(message, "MediaHandler", cause);
    this.name = "MediaHandlerError";
  }
}
