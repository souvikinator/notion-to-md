import {
  ProcessorChainNode,
  NotionExporter,
  ChainData,
  ExporterError,
} from '../../types/module';

/**
 * A chain node that manages multiple exporters and runs them as the final step
 * in our processing chain
 */
export class Exporter implements ProcessorChainNode {
  next?: ProcessorChainNode;

  constructor(private exporters: Array<NotionExporter>) {
    console.debug('[Exporter] Initializing with exporters:', {
      count: exporters?.length || 0,
    });

    if (!exporters?.length) {
      console.debug('[Exporter] No exporters provided');
    }

    console.debug('[Exporter] Successfully initialized with exporters');
  }

  async process(data: ChainData): Promise<ChainData> {
    console.debug('[Exporter] Starting export process', {
      pageId: data.pageId,
      exporterCount: this.exporters.length,
    });

    // If no exporters, just pass the data through
    if (this.exporters.length === 0) {
      console.debug('[Exporter] No exporters to run, passing data through');
      return data;
    }

    const errors: ExporterError[] = [];

    // Try all exporters, collecting errors but continuing
    for (let i = 0; i < this.exporters.length; i++) {
      const exporter = this.exporters[i];
      console.debug('[Exporter] Running exporter', {
        index: i,
        total: this.exporters.length,
      });

      try {
        await exporter.export(data);
        console.debug('[Exporter] Successfully completed export', { index: i });
      } catch (error) {
        const exporterError =
          error instanceof ExporterError
            ? error
            : new ExporterError(
                'Exporter failed',
                data.pageId,
                'export',
                error,
              );

        // Log error and continue with next exporter
        console.debug('[Exporter] Export failed', {
          index: i,
          error: exporterError.message,
          details: exporterError.details,
        });
        errors.push(exporterError);
      }
    }

    // Add any export errors to metadata for potential handling upstream
    if (errors.length > 0) {
      console.debug('[Exporter] Completed with errors', {
        errorCount: errors.length,
        totalExporters: this.exporters.length,
      });

      data.metadata = {
        ...data.metadata,
        exportErrors: errors,
      };
    } else {
      console.debug('[Exporter] All exports completed successfully');
    }

    console.debug('[Exporter] Export process finished');
    return data;
  }
}
