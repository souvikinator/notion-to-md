import { VariableResolver } from '../../../../types';
import { extractPropertyValue, formatYamlValue } from './helpers';

/**
 * Resolver for frontmatter variable that handles configuration-based
 * property extraction and formatting
 */
export const createFrontmatterResolver = (): VariableResolver => {
  return async (_, context) => {
    const config = context.metadata.config?.frontmatter;
    const properties = context.pageProperties;

    // Return empty string if no properties exist
    if (!properties || Object.keys(properties).length === 0) {
      return '';
    }

    const frontmatterObj: Record<string, any> = {};

    // Process properties according to configuration
    for (const [key, value] of Object.entries(properties)) {
      // Skip excluded properties
      if (config?.properties?.exclude?.includes(key)) {
        continue;
      }

      // Skip if not in include list (when include list exists)
      if (
        config?.properties?.include &&
        !config.properties.include.includes(key)
      ) {
        continue;
      }

      // Apply property name mapping
      const propertyName = config?.properties?.rename?.[key] || key;
      frontmatterObj[propertyName] = extractPropertyValue(value);
    }

    // Apply default values for missing properties
    if (config?.properties?.defaults) {
      for (const [key, value] of Object.entries(config.properties.defaults)) {
        if (!(key in frontmatterObj)) {
          frontmatterObj[key] = value;
        }
      }
    }

    // Format as YAML
    return `---\n${Object.entries(frontmatterObj)
      .map(([key, value]) => `${key}: ${formatYamlValue(value)}`)
      .join('\n')}\n---`;
  };
};

/**
 * Default resolver for content variable that joins collected content with newlines
 */
export const createContentResolver = (): VariableResolver => {
  return async (_, context) => {
    const collected = context.variableData.get('content') || [];
    return collected.join('\n');
  };
};

/**
 * Resolver for imports variable that handles deduplication and formatting
 */
export const createImportsResolver = (): VariableResolver => {
  return async (_, context) => {
    const imports = context.variableData.get('imports') || [];
    // Deduplicate imports while preserving order
    const uniqueImports = [...new Set(imports)];
    return uniqueImports.join('\n');
  };
};

/**
 * Creates a collection of default resolvers used by the MD renderer
 */
export const createDefaultResolvers = () => ({
  frontmatter: createFrontmatterResolver(),
  content: createContentResolver(),
  imports: createImportsResolver(),
});
