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
              group: [
                // Block only index imports and direct types imports
                '**/types/index.ts',
                '**/types/index.js',
                '**/types/index',
                // Block direct types folder import
                '**/types$',
              ],
              message:
                "Barrel imports from 'types/' are restricted to prevent cyclic dependencies. Use direct imports like 'import { Something } from 'types/specific-file'' instead.",
            },
          ],
        },
      ],
    },
  },
);
