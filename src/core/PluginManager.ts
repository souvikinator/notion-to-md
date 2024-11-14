import {
  Plugin,
  ListBlockChildrenResponseResult,
  BlockType,
  PluginContext,
} from "../plugins/types";

export class PluginManager {
  private plugins: Plugin[] = [];

  addPlugin(plugin: Plugin): void {
    this.plugins.push(plugin);
  }

  getPlugins(): Plugin[] {
    return this.plugins;
  }

  hasPluginForType(type: BlockType): boolean {
    return this.plugins.some((plugin) => {
      if (Array.isArray(plugin.type)) {
        return plugin.type.includes(type);
      }
      return plugin.type === type;
    });
  }

  async transformBlock(
    block: ListBlockChildrenResponseResult,
    context: PluginContext
  ): Promise<string> {
    const plugin = this.plugins.find((plugin) => {
      if (Array.isArray(plugin.type)) {
        return plugin.type.includes(block.type);
      }
      return plugin.type === block.type;
    });

    if (!plugin) {
      throw new Error(`No plugin found for block type: ${block.type}`);
    }

    return await Promise.resolve(plugin.transform(block, context));
  }
}
