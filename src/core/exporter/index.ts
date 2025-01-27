import {
  ProcessorChainNode,
  NotionExporter,
  ChainData,
  ExporterError,
} from "../../types";

/**
 * A chain node that manages multiple exporters and runs them as the final step
 * in our processing chain
 */
export class Exporter implements ProcessorChainNode {
  next?: ProcessorChainNode;

  constructor(private exporters: Array<NotionExporter<any>>) {
    if (!exporters?.length) {
      throw new Error("At least one exporter is required");
    }
  }

  async process(data: ChainData): Promise<ChainData> {
    const errors: ExporterError[] = [];

    // Try all exporters, collecting errors but continuing
    for (const exporter of this.exporters) {
      try {
        await exporter.export(data);
      } catch (error) {
        const exporterError =
          error instanceof ExporterError
            ? error
            : new ExporterError(
                "Exporter failed",
                data.pageId,
                "export",
                error,
              );

        // Log error and continue with next exporter
        console.error(exporterError);
        errors.push(exporterError);
      }
    }

    // Add any export errors to metadata for potential handling upstream
    if (errors.length > 0) {
      data.metadata = {
        ...data.metadata,
        exportErrors: errors,
      };
    }

    return data;
  }
}
