import { VariableResolver } from '../../../types/renderer';
import { JSXRendererConfig } from './index';
import { formatAsJSXTable } from './helpers';

/**
 * Creates a resolver for frontmatter-like property output (as a JSX table comment)
 */
export const createFrontmatterResolver = (): VariableResolver => {
  return async (_, context) => {
    const frontmatterOption = context.metadata.config?.frontmatter;
    if (!frontmatterOption) return '';
    const properties = context.pageProperties;
    if (!properties || Object.keys(properties).length === 0) return '';
    // For JSX, output as a comment with a table for dev inspection
    const table = formatAsJSXTable(properties);
    return table ? `{/*\n${table}\n*/}` : '';
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
    const config = context.metadata.config as JSXRendererConfig;
    const imports: string[] = [];
    if (config.imports?.react) {
      if (config.imports.fragments) {
        imports.push("import React, { Fragment } from 'react';");
      } else {
        imports.push("import React from 'react';");
      }
    }
    if (config.imports?.customImports) {
      imports.push(...config.imports.customImports);
    }
    // Deduplicate imports while preserving order
    const uniqueImports = [...new Set(imports)];
    return uniqueImports.join('\n') + '\n\n';
  };
};

export const createDefaultVariableResolvers = () => ({
  frontmatter: createFrontmatterResolver(),
  content: createContentResolver(),
  imports: createImportsResolver(),
  // JSX-specific variable resolvers:
  types: async (_variableName, context) => {
    const config = context.metadata.config as JSXRendererConfig;
    if (!config.typescript) return '';
    const interfaceName =
      config.component?.propsInterface || 'NotionContentProps';
    const propsType = config.component?.propsType || {};
    let typeDefinition = `interface ${interfaceName} {`;
    typeDefinition += '\n  components?: {';
    typeDefinition += '\n    [key: string]: React.ComponentType<any>;';
    typeDefinition += '\n  };';
    Object.entries(propsType).forEach(([key, type]) => {
      typeDefinition += `\n  ${key}?: ${type};`;
    });
    typeDefinition += '\n}';
    return typeDefinition;
  },
  exportStatement: async (_variableName, context) => {
    const config = context.metadata.config as JSXRendererConfig;
    const exportType = config.component?.exportType || 'named';
    return exportType === 'default'
      ? 'export default function'
      : 'export function';
  },
  componentName: async (_variableName, context) => {
    const config = context.metadata.config as JSXRendererConfig;
    return config.component?.name || 'NotionContent';
  },
  props: async (_variableName, context) => {
    const config = context.metadata.config as JSXRendererConfig;
    let propsString = '{ components = {} }';
    if (config.typescript) {
      const interfaceName =
        config.component?.propsInterface || 'NotionContentProps';
      propsString += `: ${interfaceName}`;
    }
    return propsString;
  },
  wrapperStart: async (_variableName, context) => {
    const config = context.metadata.config as JSXRendererConfig;
    if (!config.wrapContent) {
      return config.imports?.fragments ? '<>' : '<div>';
    }
    const classNamePrefix = config.styling?.classNamePrefix || 'notion-';
    const customClass = config.styling?.customClasses?.['wrapper'];
    const className = customClass || `${classNamePrefix}content`;
    return config.imports?.fragments ? '<>' : `<div className="${className}">`;
  },
  wrapperEnd: async (_variableName, context) => {
    const config = context.metadata.config as JSXRendererConfig;
    if (!config.wrapContent) {
      return config.imports?.fragments ? '</>' : '</div>';
    }
    return config.imports?.fragments ? '</>' : '</div>';
  },
});
