import { PluginManager } from "../../src/core/PluginManager";
import {
  Plugin,
  ListBlockChildrenResponseResult,
} from "../../src/plugins/types";

describe("PluginManager", () => {
  test("should register a plugin correctly", () => {
    const manager = new PluginManager();
    const mockPlugin: Plugin = {
      type: "paragraph",
      transform: (block) => "transformed",
    };

    manager.addPlugin(mockPlugin);
    expect(manager.getPlugins()).toContainEqual(mockPlugin);
  });

  test("should register multiple plugins for same type", () => {
    const manager = new PluginManager();
    const plugin1: Plugin = {
      type: "paragraph",
      transform: () => "first",
    };
    const plugin2: Plugin = {
      type: "paragraph",
      transform: () => "second",
    };

    manager.addPlugin(plugin1);
    manager.addPlugin(plugin2);
    expect(manager.getPlugins().length).toBe(2);
  });

  test("should handle array of block types", () => {
    const manager = new PluginManager();
    const plugin: Plugin = {
      type: ["paragraph", "heading_1"],
      transform: () => "transformed",
    };

    manager.addPlugin(plugin);
    expect(manager.hasPluginForType("paragraph")).toBe(true);
    expect(manager.hasPluginForType("heading_1")).toBe(true);
  });

  test("should transform block using registered plugin", async () => {
    const manager = new PluginManager();
    const mockBlock = {
      type: "paragraph",
      paragraph: { rich_text: [{ type: "text", text: { content: "test" } }] },
    } as ListBlockChildrenResponseResult;

    const mockContext = {
      getChildren: jest.fn(),
    };

    const plugin: Plugin = {
      type: "paragraph",
      transform: (block) => "transformed",
    };

    manager.addPlugin(plugin);
    const result = await manager.transformBlock(mockBlock, mockContext);
    expect(result).toBe("transformed");
  });

  test("should throw error for unhandled block type", async () => {
    const manager = new PluginManager();
    const mockBlock = {
      type: "unknown",
      unknown: { text: "test" },
    } as ListBlockChildrenResponseResult;

    const mockContext = {
      getChildren: jest.fn(),
    };

    await expect(
      manager.transformBlock(mockBlock, mockContext)
    ).rejects.toThrow("No plugin found for block type: unknown");
  });
});
