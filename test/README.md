# Test Suite

This directory contains all tests for the notion-to-md project, organized by type and purpose.

## Directory Structure

```
test/
├── unit/                    # Unit tests (Jest)
│   ├── test-jsx-renderer.ts
│   └── __snapshots__/
├── integration/             # Integration tests
│   └── test-math-issue-case.js
├── features/                # Feature-specific tests
│   ├── test-math-rendering.js
│   ├── test-nested-numbered-lists.js
│   └── test-mdx-spacing.js
└── run-all-tests.js         # Test runner script
```

## Test Types

### Unit Tests (`unit/`)
- **Framework**: Jest
- **Purpose**: Test individual components and functions in isolation
- **Files**: TypeScript files with `.ts` extension
- **Run**: `npm test` or `npm run test:unit`

### Integration Tests (`integration/`)
- **Framework**: Node.js
- **Purpose**: Test complete workflows and complex scenarios
- **Files**: JavaScript files with `.js` extension
- **Run**: `npm run test:integration`

### Feature Tests (`features/`)
- **Framework**: Node.js
- **Purpose**: Test specific features and edge cases
- **Files**: JavaScript files with `.js` extension
- **Run**: `npm run test:features`

## Running Tests

### Run All Tests
```bash
npm run test:all
```

### Run Specific Test Types
```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# Feature tests only
npm run test:features
```

### Run Individual Tests
```bash
# Unit tests
npm test

# Specific integration test
node test/integration/test-math-issue-case.js

# Specific feature test
node test/features/test-math-rendering.js
```

## Test Coverage

The test suite covers:

1. **JSX Renderer**: Complete renderer functionality with snapshots
2. **Math Rendering**: Inline and block equation rendering
3. **List Handling**: Nested numbered and bulleted lists
4. **MDX Spacing**: Proper spacing and formatting
5. **Complex Scenarios**: Real-world mathematical proofs with mixed content

## Adding New Tests

1. **Unit Tests**: Add to `unit/` directory with `.ts` extension
2. **Integration Tests**: Add to `integration/` directory with `.js` extension
3. **Feature Tests**: Add to `features/` directory with `.js` extension
4. **Update Test Runner**: Add new tests to `run-all-tests.js` if needed 