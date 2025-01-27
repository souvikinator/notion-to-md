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
    for (const exporter of this.exporters) {
      try {
        await exporter.export(data);
      } catch (error) {
        // Convert to ExporterError if it isn't one already
        const exporterError =
          error instanceof ExporterError
            ? error
            : new ExporterError(
                "Exporter failed",
                data.pageId,
                "export",
                error,
              );

        // Re-throw to stop the chain - we want to know if exports fail
        throw exporterError;
      }
    }

    return data;
  }
}
