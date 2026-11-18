import type { Linter } from 'eslint';
import { globalIgnores } from 'eslint/config';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tseslint from 'typescript-eslint';

import withNuxt from './.nuxt/eslint.config.mjs';
import localImportRules from './eslint-rules/canonical-import-paths.ts';

// Extract only the rules from the strict-type-checked-only preset,
// avoiding the plugin/parser registration that conflicts with @nuxt/eslint.
const strictRules: Linter.RulesRecord = {};
for (const config of tseslint.configs.strictTypeChecked) {
  if (config.rules) Object.assign(strictRules, config.rules);
}

export default withNuxt(
  globalIgnores([
    '.data/',
    '.github/',
    '.nuxt/',
    '.opencode/',
    '.tmp/',
    '.vscode/',
    'content/',
    'docs/',
    'node_modules/',
    'playwright-report/',
    'public/',
    'supabase/',
    'shared/types/database.types.ts',
    'test-results/',
  ]),
  {
    files: ['**/*.ts', '**/*.vue'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['**/*.ts', '**/*.vue'],
    rules: {
      ...strictRules,
      'vue/html-self-closing': 'off',
      'vue/no-multiple-template-root': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/consistent-type-assertions': 'error',
      '@typescript-eslint/no-unsafe-type-assertion': 'error',
      'local/canonical-import-paths': 'error',
      'simple-import-sort/imports': [
        'warn',
        {
          groups: [
            // Side-effect imports.
            ['^\\u0000'],
            // Node.js builtins.
            ['^node:'],
            // External packages, including scoped ones.
            ['^@?\\w'],
            // Aliases: `#…` before `~/…`.
            ['^#', '^~'],
            // Relative imports (banned by canonical-import-paths; safety net).
            ['^\\.'],
          ],
        },
      ],
      'simple-import-sort/exports': 'warn',
    },
    plugins: {
      local: localImportRules,
      'simple-import-sort': simpleImportSort,
    },
  },
  {
    files: ['eslint.config.ts'],
    rules: {
      'local/canonical-import-paths': 'off',
    },
  },
);
