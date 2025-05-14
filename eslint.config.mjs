// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    plugins: {
      prettier: eslintPluginPrettier,
    },
  },
  eslintPluginPrettierRecommended, // ensures Prettier runs as part of linting
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',

      // ESLint formatting rules that conflict with Prettier
      'function-paren-newline': 'off',
      'comma-dangle': ['error', 'only-multiline'],
      'arrow-parens': ['error', 'always'],
      radix: 'off',

      // Enable Prettier and customize it
      'prettier/prettier': [
        'error',
        {
          endOfLine: 'auto',
          printWidth: 120,
          semi: true,
          singleQuote: true,
          trailingComma: 'all',
          bracketSpacing: true,
          arrowParens: 'always',
        },
      ],
    },
  },
);
