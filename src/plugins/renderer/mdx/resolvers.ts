import { FrontmatterConfig } from '.';
import { VariableResolver } from '../../../types/renderer';
import { extractPropertyValue, formatFrontmatter } from './helpers';

/**
 * Resolver for frontmatter variable that handles configuration-based
 * property extraction and formatting
 */
/**
 * Creates a resolver for frontmatter that handles both boolean and detailed configuration
 */
export const createFrontmatterResolver = (): VariableResolver => {
  return async (_, context) => {
    const frontmatterOption = context.metadata.config?.frontmatter;

    // Early return if disabled
    if (!frontmatterOption) {
      return '';
    }

    const properties = context.pageProperties;
    if (!properties || Object.keys(properties).length === 0) {
      return '';
    }

    // Use provided config or default if just true
    const config: FrontmatterConfig =
      frontmatterOption === true
        ? getDefaultFrontmatterConfig()
        : frontmatterOption;

    const frontmatterObj: Record<string, any> = {};

    // Process properties according to configuration
    for (const [key, property] of Object.entries(properties)) {
      // Skip if explicitly excluded
      if (config.exclude?.includes(key)) {
        continue;
      }

      // Skip if not in include list when specified
      if (config.include && !config.include.includes(key)) {
        continue;
      }

      // Apply property name mapping or use original
      const propertyName = config.rename?.[key] || key;

      // Apply transformation function if specified
      if (config.transform?.[key]) {
        try {
          frontmatterObj[propertyName] = config.transform[key](
            property,
            properties,
          );
        } catch (error) {
          console.error(`Error transforming property ${key}:`, error);
          // Fallback to extracted value
          frontmatterObj[propertyName] = extractPropertyValue(property);
        }
      } else {
        // Use standard extraction
        frontmatterObj[propertyName] = extractPropertyValue(property);
      }
    }

    // Apply any provided defaults
    if (config.defaults) {
      for (const [key, value] of Object.entries(config.defaults)) {
        if (!(key in frontmatterObj)) {
          frontmatterObj[key] = value;
        }
      }
    }

    return formatFrontmatter(frontmatterObj);
  };
};
/**
 * Default resolver for content variable that joins collected content with newlines
 */
export const createContentResolver = (): VariableResolver => {
  return async (_, context) => {
    const collected = context.variableData.get('content') || [];
    return collected.filter((line) => line.trim()).join('\n');
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
    return uniqueImports.join('\n') + '\n\n';
  };
};

export function getDefaultFrontmatterConfig(): FrontmatterConfig {
  return {
    // No include = include all properties
    include: undefined,
    // No exclude = exclude none
    exclude: undefined,
    // No rename mappings
    rename: undefined,
    // No default values
    defaults: undefined,
    // No transform functions
    transform: undefined,
  };
}

/**
 * Creates a collection of default resolvers used by the MD renderer
 */
export const createDefaultVariableResolvers = () => ({
  frontmatter: createFrontmatterResolver(),
  content: createContentResolver(),
  imports: createImportsResolver(),
});
