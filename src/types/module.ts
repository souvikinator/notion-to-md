import {
  MediaManifestManager,
  PageReferenceManifestManager,
} from '../utils/index';
import { ExtendedFetcherOutput } from './notion';

export interface ChainData {
  pageId: string;
  blockTree: ExtendedFetcherOutput;
  metadata?: Record<string, any>;
  content: string;
  manifests: {
    media?: MediaManifestManager;
    pageRef?: PageReferenceManifestManager;
  };
}

export interface ProcessorChainNode {
  // Reference to the next processor in the chain
  next?: ProcessorChainNode;
  // Main processing method that each node must implement
  process(data: ChainData): Promise<ChainData>;
}

// The interface that all exporters must implement
export interface NotionExporter<TConfig = unknown> {
  export(data: ChainData): Promise<void>;
}

/**
 * Types for exporters
 */
// Standard error class for consistent error handling across all exporters
export class ExporterError extends Error {
  constructor(
    message: string,
    public readonly pageId: string,
    public readonly operation: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ExporterError';
  }
}
