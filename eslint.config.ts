import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              // This pattern matches paths that end exactly with 'types'
              group: ['*'],
              regex: '.*/types$',
              message:
                "Direct imports from 'types/' are restricted to prevent cyclic dependencies. Use direct imports like 'import { Something } from 'types/specific-file'' instead.",
            },
            {
              // This pattern matches any index files under types directory
              group: ['*'],
              regex: '.*/types/index(\\.ts|\\.js)?$',
              message:
                "Imports from index files are restricted to prevent cyclic dependencies. Use direct imports like 'import { Something } from 'types/specific-file'' instead.",
            },
          ],
        },
      ],
    },
  },
);
