import fs from 'fs/promises';
import path from 'path';
import { NotionExporter, ChainData, ExporterError } from '../../types';

/**
 * Configuration for the FileSystemExporter
 */
export interface DefaultExporterConfig {
  // Output type: 'file', 'stdout', or 'buffer'
  outputType: 'file' | 'stdout' | 'buffer';

  // For 'file' type: path where files will be written, directories will be created if they don't exist
  outputPath?: string;

  // For 'buffer' type: reference to store the content
  buffer?: { [key: string]: string };
}

/**
 * Default exporter that handles saving content to the filesystem,
 * printing to stdout, or storing in a buffer
 */
export class DefaultExporter implements NotionExporter<DefaultExporterConfig> {
  constructor(private config: DefaultExporterConfig) {
    this.validateConfig();
  }

  /**
   * Export the conversion result according to configuration
   */
  public async export(data: ChainData): Promise<void> {
    try {
      const { pageId, content } = data;

      switch (this.config.outputType) {
        case 'file':
          await this.exportToFile(pageId, content);
          break;

        case 'stdout':
          this.exportToStdout(content);
          break;

        case 'buffer':
          this.exportToBuffer(pageId, content);
          break;
      }
    } catch (error) {
      throw new ExporterError(
        `Export failed: ${error instanceof Error ? error.message : String(error)}`,
        data.pageId,
        'export',
        error,
      );
    }
  }

  /**
   * Export content to a file
   */
  private async exportToFile(pageId: string, content: string): Promise<void> {
    if (!this.config.outputPath) {
      throw new Error('outputPath is required for file output type');
    }

    // Get the directory path from the full file path
    const dirPath = path.dirname(this.config.outputPath);

    // Create all parent directories if they don't exist
    await fs.mkdir(dirPath, { recursive: true });

    try {
      await fs.writeFile(this.config.outputPath, content, 'utf-8');
    } catch (error) {
      throw new Error(
        `Failed to write file: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Export content to stdout
   */
  private exportToStdout(content: string): void {
    console.log(content);
  }

  /**
   * Export content to a buffer object
   */
  private exportToBuffer(pageId: string, content: string): void {
    if (!this.config.buffer) {
      throw new Error('buffer is required for buffer output type');
    }

    this.config.buffer[pageId] = content;
  }

  /**
   * Validate the provided configuration
   */
  private validateConfig(): void {
    if (!this.config.outputType) {
      throw new Error('outputType is required');
    }

    if (this.config.outputType === 'file' && !this.config.outputPath) {
      throw new Error('outputPath is required for file output type');
    }

    if (this.config.outputType === 'buffer' && !this.config.buffer) {
      throw new Error('buffer is required for buffer output type');
    }
  }
}
