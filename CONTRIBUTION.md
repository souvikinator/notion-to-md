# Contribution Guide

> [!NOTE]
> This guide focuses on contributing to the [v4 branch](https://github.com/souvikinator/notion-to-md/tree/v4.0.0-alpha).

Thank you for your interest in contributing to notion-to-md v4! 🎉

notion-to-md v4 represents a fundamental re-imagining of Notion content conversion. We're building more than just a Markdown converter - we're creating a comprehensive content transformation system that adapts to diverse output formats, integrates seamlessly into any workflow, and preserves the richness of Notion content.

This guide will help you get started with contributing to the project, whether you're fixing bugs, adding features, improving documentation, or creating plugins.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Environment Setup](#development-environment-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Code Standards](#code-standards)
- [Pull Request Process](#pull-request-process)

## Getting Started

### First-Time Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/notion-to-md.git
   cd notion-to-md
   ```

3. **Add the upstream remote:**
   ```bash
   git remote add upstream https://github.com/souvikinator/notion-to-md.git
   ```

4. **Switch to the development branch:**
   ```bash
   git checkout v4.0.0-alpha
   ```

## Development Environment Setup

### Install Dependencies

```bash
npm install
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Build the project using tsup |
| `npm run clean` | Clean build artifacts |
| `npm test` | Run all tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:ui` | Open Vitest UI for interactive testing |
| `npm run test:coverage` | Generate test coverage report |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

### Build and Test Locally

```bash
# Clean and build
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint and format
npm run lint
npm run format
```

### Quick Development Test

Create a simple test file to verify your setup:

```javascript
// local-test.js
import { Client } from '@notionhq/client';
import { NotionConverter } from './build/index.js'; // make sure to npm run build prior running this script.

const notion = new Client({
  auth: 'your-notion-token-here' // Optional for basic testing
});

const converter = new NotionConverter(notion);
const result = await n2m.convert("target page id");
console.log('output content: ', result);
```

Run with: `node local-test.js`

## Project Structure

```
notion-to-md/
├── src/                          # Source code
│   ├── core/                     # Core conversion engine
│   ├── plugins/                  # Built-in plugins
│   │   ├── renderer/             # Renderer plugins (MD, MDX)
│   │   └── exporter/             # Exporter plugins
│   ├── types/                    # TypeScript type definitions
│   └── utils/                    # Utility functions
├── tests/                        # Test suites
│   ├── unit/                     # Unit tests
│   ├── integration/              # Integration tests
│   └── fixtures/                 # Test data and mocks
├── plugins/                      # Contains offical plugins that are not shipped with the package (more on this below)
├── docs/                         # Documentation (Hugo site)
├── build/                        # Build output (generated)
├── .github/workflows/            # CI/CD workflows
└── package.json                  # Project configuration
```

### Key Components

- **Core Engine**: `src/core/` - Main conversion logic and chain processors
- **Plugin System**:
  - `src/plugins/` - This contains the default MD/MDX plugin that ships with the package
  - `plugins/` - This contains any other official plugin (as a standalone npm package) that user can install and use it with the notion-to-md package
- **Type System**: `src/types/` - Comprehensive TypeScript definitions
- **Testing**: `tests/` - Comprehensive test coverage with Vitest

## Development Workflow

### 1. Create a Feature Branch

```bash
# Make sure you're on the latest v4.0.0-alpha branch
git checkout v4.0.0-alpha
git pull upstream v4.0.0-alpha

# Create your feature branch
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

- Follow the existing code style and patterns
- Update documentation if needed
- Test your changes thoroughly
- Make sure to add/update unit tests covering all positive and negative test cases for any added feature or fix. (detailed guide on [testing](#testing))

### 3. Run Quality Checks

```bash
# Run all quality checks before committing
npm run lint
npm run format
npm test
npm run build
```

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub targeting the `v4.0.0-alpha` branch.

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test files
npm test -- tests/unit/core/

# Run tests in watch mode during development
npm run test:watch

# Open interactive test UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Writing Tests

We use Vitest for testing. Here's the general structure:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { YourClass } from '../src/path/to/class';

describe('YourClass', () => {
  let instance: YourClass;

  beforeEach(() => {
    instance = new YourClass();
  });

  it('should do something expected', () => {
    const result = instance.doSomething();
    expect(result).toBe('expected value');
  });
});
```

### Test Categories

- If working with **utils**, make sure every method is tested against possible negative and positive scenarios.
- If working with a module/class, make sure to test it as a black box, i.e, instead of testing its private or public methods, test for various negative and positive input and how it should be behaving. ([example](https://github.com/souvikinator/notion-to-md/blob/v4.0.0-alpha/tests/unit/core/page-ref-handler.test.ts))

## Code Standards

### TypeScript Guidelines

- Use strict TypeScript configuration
- Provide proper type annotations
- Avoid `any` types when possible
- Use interfaces for object shapes
- Export types that might be useful for plugin developers
- While writing tests, make sure to properly mock Notion blocks or pages.

### Naming Conventions

- **Files**: kebab-case (`page-ref-handler.ts`)
- **Classes**: PascalCase (`NotionConverter`)
- **Functions/Variables**: camelCase (`convertPage`)
- **Constants**: UPPER_SNAKE_CASE (`DEFAULT_CONFIG`)
- **Types/Interfaces**: PascalCase (`ChainData`, `ProcessorConfig`)

## Pull Request Process

### Before Submitting

✅ **Checklist:**
- [ ] Tests pass (`npm test`)
- [ ] Code is linted (`npm run lint`)
- [ ] Code is formatted (`npm run format`)
- [ ] Build succeeds (`npm run build`)
- [ ] Documentation updated (if needed)
- [ ] Changelog entry added (for significant changes)

### PR Requirements

1. **Target Branch**: Always target `v4.0.0-alpha`
2. **Description**: Provide a clear description of changes, throw in some before and after behaviour or screenshots.
3. **Tests**: Include relevant tests for your changes
4. **Documentation**: Update docs for user-facing changes
5. **Examples**: Add examples for new features when applicable

---

Thank you for contributing to notion-to-md v4! Your efforts help make Notion content conversion better for everyone. 🚀

**Happy coding!** 🎉
