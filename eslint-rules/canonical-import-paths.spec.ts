// RuleTester coverage for the project's custom import restriction.
import { basename, dirname, resolve, sep } from 'node:path';

import { Linter, RuleTester } from 'eslint';
import tseslint from 'typescript-eslint';
import { describe, expect, it, vi } from 'vitest';
import vueParser from 'vue-eslint-parser';

import { canonicalImportPaths as rule } from '#eslint-rules/canonical-import-paths';

const mockedFiles = vi.hoisted(() => new Set<string>());

vi.mock('node:fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs')>();
  return {
    ...actual,
    existsSync(path: Parameters<typeof actual.existsSync>[0]) {
      if (typeof path === 'string') {
        const normalizedPath = resolve(path).toLowerCase();
        if (
          [...mockedFiles].some((file) => {
            const normalizedFile = resolve(file).toLowerCase();
            return (
              normalizedFile === normalizedPath ||
              normalizedFile.startsWith(`${normalizedPath}${sep}`)
            );
          })
        ) {
          return true;
        }
      }
      return actual.existsSync(path);
    },
    readdirSync(
      path: Parameters<typeof actual.readdirSync>[0],
      options: { encoding: 'utf8' } = { encoding: 'utf8' },
    ) {
      const directory = resolve(path.toString()).toLowerCase();
      const mockedEntries = [...mockedFiles]
        .filter((file) => dirname(file).toLowerCase() === directory)
        .map((file) => basename(file));
      let actualEntries: string[] = [];
      try {
        actualEntries = actual.readdirSync(path, options);
      } catch {
        if (mockedEntries.length === 0) throw new Error('Directory not found');
      }
      return [...actualEntries, ...mockedEntries];
    },
  };
});

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const root = process.cwd();
const filename = (path: string) => `${root}/${path}`;
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;
const isUnknownArray = (value: unknown): value is unknown[] =>
  Array.isArray(value);

const legacyImportParser: NonNullable<Linter.LanguageOptions['parser']> = {
  ...tseslint.parser,
  parseForESLint(code) {
    const parsed = tseslint.parser.parseForESLint(code);
    const ast = parsed.ast;
    if (!isRecord(ast) || !isUnknownArray(ast.body)) return parsed;

    const statement = ast.body[0];
    if (!isRecord(statement) || !isRecord(statement.expression)) return parsed;

    if (
      statement.type === 'ExpressionStatement' &&
      statement.expression.type === 'ImportExpression' &&
      isRecord(statement.expression.source)
    ) {
      const importExpression = statement.expression;
      Object.defineProperty(importExpression, 'type', {
        value: 'CallExpression',
      });
      Object.defineProperty(importExpression, 'callee', {
        value: { type: 'Import' },
      });
      Object.defineProperty(importExpression, 'arguments', {
        value: [importExpression.source],
      });
      Object.defineProperty(importExpression, 'optional', { value: false });
    }

    return parsed;
  },
};

new RuleTester({
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      ecmaFeatures: { jsx: true },
    },
  },
}).run('canonical-import-paths', rule, {
  valid: [
    {
      filename: filename('app/services/example.ts'),
      code: `import { value } from '#shared/value';`,
    },
    {
      filename: filename('app/services/example.ts'),
      code: `import { value } from '~/model/value';`,
    },
    {
      filename: filename('app/services/example.ts'),
      code: `void import('package-name');`,
    },
    {
      filename: filename('app/services/example.ts'),
      code: 'void import(`./${moduleName}`);',
    },
    {
      name: 'does not treat a computed vi member as a static mock call',
      filename: filename('test/unit/example.spec.ts'),
      code: `const mock = 'fn'; vi[mock]('./value');`,
    },
    {
      name: 'does not treat a computed expression as a static mock call',
      filename: filename('test/unit/example.spec.ts'),
      code: `vi[getMockName()]('./value');`,
    },
  ],
  invalid: [
    {
      name: 'fixes static imports and preserves multiline formatting and quotes',
      filename: filename('app/services/example.ts'),
      code: `import {\n  Button,\n} from '../components/Button.vue';`,
      output: `import {\n  Button,\n} from '~/components/Button.vue';`,
      errors: [{ messageId: 'useAlias' }],
    },
    {
      name: 'normalizes static testUtils alias imports',
      filename: filename('test/testServices.ts'),
      code: `import { MailpitService } from '#test/testUtils/MailpitService';`,
      output: `import { MailpitService } from '#test/MailpitService';`,
      errors: [{ messageId: 'useAlias' }],
    },
    {
      name: 'normalizes testUtils re-exports',
      filename: filename('test/testServices.ts'),
      code: `export { MailpitService } from '#test/testUtils/MailpitService';`,
      output: `export { MailpitService } from '#test/MailpitService';`,
      errors: [{ messageId: 'useAlias' }],
    },
    {
      name: 'normalizes testUtils dynamic imports',
      filename: filename('test/testServices.ts'),
      code: `import('#test/testUtils/TestUserService');`,
      output: `import('#test/TestUserService');`,
      errors: [{ messageId: 'useAlias' }],
    },
    {
      name: 'normalizes testUtils mock-style calls',
      filename: filename('test/testServices.ts'),
      code: `vi.mock('#test/testUtils/mocks');`,
      output: `vi.mock('#test/mocks');`,
      errors: [{ messageId: 'useAlias' }],
    },
    {
      name: 'normalizes testUtils require calls',
      filename: filename('test/testServices.ts'),
      code: `require('#test/testUtils/testDao');`,
      output: `require('#test/testDao');`,
      errors: [{ messageId: 'useAlias' }],
    },
    {
      name: 'normalizes testUtils TypeScript import types',
      filename: filename('test/testServices.ts'),
      code: `type User = import('#test/testUtils/TestUser').TestUser;`,
      output: `type User = import('#test/TestUser').TestUser;`,
      errors: [{ messageId: 'useAlias' }],
    },
    {
      name: 'normalizes testUtils imports in Vue scripts',
      filename: filename('test/Example.vue'),
      languageOptions: {
        parser: vueParser,
        parserOptions: {
          parser: tseslint.parser,
          ecmaVersion: 'latest',
          sourceType: 'module',
        },
      },
      code: `<script setup lang="ts">\nimport type { TestUser } from '#test/testUtils/TestUser';\n</script>`,
      output: `<script setup lang="ts">\nimport type { TestUser } from '#test/TestUser';\n</script>`,
      errors: [{ messageId: 'useAlias' }],
    },
    {
      name: 'reports but does not fix a colliding testUtils alias',
      filename: filename('test/testServices.ts'),
      code: `import { TestUser } from '#test/testUtils/TestUser';`,
      errors: [{ messageId: 'useAlias' }],
      before() {
        mockedFiles.add(resolve(root, 'test/TestUser.ts'));
      },
      after() {
        mockedFiles.delete(resolve(root, 'test/TestUser.ts'));
      },
    },
    {
      name: 'does not fix when JavaScript extension substitution changes target',
      filename: filename('test/testServices.ts'),
      code: `import safety from '#test/testUtils/safety.js';`,
      errors: [{ messageId: 'useAlias' }],
      before() {
        mockedFiles.add(resolve(root, 'test/testUtils/safety.js'));
        mockedFiles.add(resolve(root, 'test/safety.ts'));
      },
      after() {
        mockedFiles.delete(resolve(root, 'test/testUtils/safety.js'));
        mockedFiles.delete(resolve(root, 'test/safety.ts'));
      },
    },
    {
      name: 'does not fix case-insensitive extension collisions',
      filename: filename('test/testServices.ts'),
      code: `import safety from '#test/testUtils/safety.js';`,
      errors: [{ messageId: 'useAlias' }],
      before() {
        mockedFiles.add(resolve(root, 'test/testUtils/safety.js'));
        mockedFiles.add(resolve(root, 'test/Safety.ts'));
      },
      after() {
        mockedFiles.delete(resolve(root, 'test/testUtils/safety.js'));
        mockedFiles.delete(resolve(root, 'test/Safety.ts'));
      },
    },
    {
      name: 'does not fix case-insensitive directory and index collisions',
      filename: filename('test/testServices.ts'),
      code: `import safety from '#test/testUtils/Package/index.js';`,
      errors: [{ messageId: 'useAlias' }],
      before() {
        mockedFiles.add(resolve(root, 'test/testUtils/Package/index.js'));
        mockedFiles.add(resolve(root, 'test/Package/Index.ts'));
      },
      after() {
        mockedFiles.delete(resolve(root, 'test/testUtils/Package/index.js'));
        mockedFiles.delete(resolve(root, 'test/Package/Index.ts'));
      },
    },
    ...[
      { sourceExtension: '.jsx', competingExtension: '.ts' },
      { sourceExtension: '.js', competingExtension: '.jsx' },
      { sourceExtension: '.ts', competingExtension: '.tsx' },
      { sourceExtension: '.mts', competingExtension: '.d.mts' },
    ].map(({ sourceExtension, competingExtension }) => {
      const sourceFile = resolve(
        root,
        'test/testUtils',
        `safety${sourceExtension}`,
      );
      const competingFile = resolve(
        root,
        'test',
        `safety${competingExtension}`,
      );

      return {
        name: `does not fix ${sourceExtension} when ${competingExtension} shadows it`,
        filename: filename('test/testServices.ts'),
        code: `import safety from '#test/testUtils/safety${sourceExtension}';`,
        errors: [{ messageId: 'useAlias' }],
        before() {
          mockedFiles.add(sourceFile);
          mockedFiles.add(competingFile);
        },
        after() {
          mockedFiles.delete(sourceFile);
          mockedFiles.delete(competingFile);
        },
      };
    }),
    {
      name: 'fixes an extension path when no competing file exists',
      filename: filename('test/testServices.ts'),
      code: `import safety from '#test/testUtils/safety.jsx';`,
      output: `import safety from '#test/safety.jsx';`,
      errors: [{ messageId: 'useAlias' }],
      before() {
        mockedFiles.add(resolve(root, 'test/testUtils/safety.jsx'));
      },
      after() {
        mockedFiles.delete(resolve(root, 'test/testUtils/safety.jsx'));
      },
    },
    {
      name: 'fixes re-exports to the matching server alias',
      filename: filename('server/api/example.ts'),
      code: `export { value } from '../domain/value';`,
      output: `export { value } from '#server/domain/value';`,
      errors: [{ messageId: 'useAlias' }],
    },
    {
      name: 'fixes star re-exports',
      filename: filename('shared/api/example.ts'),
      code: `export * from './value';`,
      output: `export * from '#shared/api/value';`,
      errors: [{ messageId: 'useAlias' }],
    },
    {
      name: 'fixes dynamic imports',
      filename: filename('app/pages/example.ts'),
      code: `import('../components/Example.vue');`,
      output: `import('~/components/Example.vue');`,
      errors: [{ messageId: 'useAlias' }],
    },
    {
      name: 'fixes legacy dynamic imports represented as CallExpression',
      filename: filename('app/pages/example.ts'),
      languageOptions: {
        parser: legacyImportParser,
        parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
      },
      code: `import('../components/Example.vue');`,
      output: `import('~/components/Example.vue');`,
      errors: [{ messageId: 'useAlias' }],
    },
    {
      name: 'fixes static template-literal imports',
      filename: filename('app/pages/example.ts'),
      code: 'void import(`../components/Example.vue`);',
      output: 'void import(`~/components/Example.vue`);',
      errors: [{ messageId: 'useAlias' }],
    },
    {
      name: 'fixes TypeScript import types to the app alias',
      filename: filename('app/model/example.ts'),
      code: `type Value = import('./value').Value;`,
      output: `type Value = import('~/model/value').Value;`,
      errors: [{ messageId: 'useAlias' }],
    },
    {
      name: 'fixes TypeScript import types using ~~ aliases',
      filename: filename('app/model/example.ts'),
      code: `type Database = import('~~/shared/types/database.types').Database;`,
      output: `type Database = import('#shared/types/database.types').Database;`,
      errors: [{ messageId: 'useAlias' }],
    },
    {
      name: 'does not fix specifiers containing the quote delimiter',
      filename: filename('app/services/example.ts'),
      code: 'import value from "./say\\"hello";',
      errors: [{ messageId: 'useAlias' }],
    },
    {
      name: 'does not fix specifiers containing backslashes',
      filename: filename('app/services/example.ts'),
      code: 'import value from "./say\\\\hello";',
      errors: [{ messageId: 'useAlias' }],
    },
    {
      name: 'does not fix template literals containing their delimiter',
      filename: filename('app/services/example.ts'),
      code: 'void import(`./say\\`hello`);',
      errors: [{ messageId: 'useAlias' }],
    },
    {
      name: 'preserves .js extensions, directory and index imports',
      filename: filename('app/services/example.ts'),
      code: [
        `import file from '../utils/file.js';`,
        `import directory from '../utils';`,
        `import index from '../utils/index.js';`,
      ].join('\n'),
      output: [
        `import file from '~/utils/file.js';`,
        `import directory from '~/utils';`,
        `import index from '~/utils/index.js';`,
      ].join('\n'),
      errors: [
        { messageId: 'useAlias' },
        { messageId: 'useAlias' },
        { messageId: 'useAlias' },
      ],
    },
    {
      name: 'preserves query suffix spelling',
      filename: filename('app/services/example.ts'),
      code: `import file from '../utils/file.js?raw';`,
      output: `import file from '~/utils/file.js?raw';`,
      errors: [{ messageId: 'useAlias' }],
    },
    {
      name: 'preserves hash suffix spelling',
      filename: filename('app/services/example.ts'),
      code: `import file from '../utils/file.js#fragment';`,
      output: `import file from '~/utils/file.js#fragment';`,
      errors: [{ messageId: 'useAlias' }],
    },
    {
      name: 'fixes TSX imports to the app alias',
      filename: filename('app/components/example.tsx'),
      code: `import Widget from '../components/Widget';\nexport const view = <Widget />;`,
      output: `import Widget from '~/components/Widget';\nexport const view = <Widget />;`,
      errors: [{ messageId: 'useAlias' }],
    },
    {
      name: 'fixes vi.mock string specifiers',
      filename: filename('test/unit/example.spec.ts'),
      code: `vi.mock('../fixtures/value');`,
      output: `vi.mock('#test/fixtures/value');`,
      errors: [{ messageId: 'useAlias' }],
    },
    {
      name: 'fixes computed string-literal vi.mock specifiers',
      filename: filename('test/unit/example.spec.ts'),
      code: 'vi["mock"]("./value");',
      output: 'vi["mock"]("#test/unit/value");',
      errors: [{ messageId: 'useAlias' }],
    },
    {
      name: 'fixes computed string-literal jest.doMock specifiers',
      filename: filename('test/unit/example.spec.ts'),
      code: `jest['doMock']('../fixtures/value');`,
      output: `jest['doMock']('#test/fixtures/value');`,
      errors: [{ messageId: 'useAlias' }],
    },
    {
      name: 'fixes computed static-template vi.mock specifiers',
      filename: filename('test/unit/example.spec.ts'),
      code: 'vi[`mock`](`./value`);',
      output: 'vi[`mock`](`#test/unit/value`);',
      errors: [{ messageId: 'useAlias' }],
    },
    {
      name: 'fixes computed static-template jest.doMock specifiers',
      filename: filename('test/unit/example.spec.ts'),
      code: 'jest[`doMock`](`../fixtures/value`);',
      output: 'jest[`doMock`](`#test/fixtures/value`);',
      errors: [{ messageId: 'useAlias' }],
    },
    {
      name: 'fixes require string specifiers',
      filename: filename('server/api/example.ts'),
      code: `require('../service/value');`,
      output: `require('#server/service/value');`,
      errors: [{ messageId: 'useAlias' }],
    },
    {
      name: 'fixes TypeScript import-equals specifiers',
      filename: filename('server/api/example.ts'),
      code: `import value = require('../service/value');`,
      output: `import value = require('#server/service/value');`,
      errors: [{ messageId: 'useAlias' }],
    },
    {
      name: 'fixes root aliases using known Nuxt aliases',
      filename: filename('app/services/example.ts'),
      code: [
        `import shared from "~~/shared/value";`,
        `import server from '~~/server/service/value';`,
        `import tests from '~~/test/fixtures/value';`,
      ].join('\n'),
      output: [
        `import shared from "#shared/value";`,
        `import server from '#server/service/value';`,
        `import tests from '#test/fixtures/value';`,
      ].join('\n'),
      errors: [
        { messageId: 'useAlias' },
        { messageId: 'useAlias' },
        { messageId: 'useAlias' },
      ],
    },
    {
      name: 'maps root aliases in testUtils directly to #test',
      filename: filename('app/services/example.ts'),
      code: `import { MailpitService } from '~~/test/testUtils/MailpitService';`,
      output: `import { MailpitService } from '#test/MailpitService';`,
      errors: [{ messageId: 'useAlias' }],
    },
    {
      name: 'maps relative imports in testUtils directly to #test',
      filename: filename('test/e2e/pages/example.ts'),
      code: `import { TestUser } from '../../testUtils/TestUser';`,
      output: `import { TestUser } from '#test/TestUser';`,
      errors: [{ messageId: 'useAlias' }],
    },
    {
      name: 'fixes Vue script imports using the app alias',
      filename: filename('app/components/example.vue'),
      languageOptions: {
        parser: vueParser,
        parserOptions: {
          parser: tseslint.parser,
          ecmaVersion: 'latest',
          sourceType: 'module',
        },
      },
      code: `<script setup lang="ts">\nimport Button from './Button.vue';\n</script>`,
      output: `<script setup lang="ts">\nimport Button from '~/components/Button.vue';\n</script>`,
      errors: [{ messageId: 'useAlias' }],
    },
    {
      name: 'reports without fixing when there is no matching alias',
      filename: filename('nuxt.config.ts'),
      code: `import helper from './helper';`,
      errors: [{ messageId: 'useAlias' }],
    },
    {
      name: 'reports without fixing unknown root paths',
      filename: filename('app/services/example.ts'),
      code: `import helper from '~~/scripts/helper';`,
      errors: [{ messageId: 'useAlias' }],
    },
  ],
});

describe('canonical-import-paths autofix', () => {
  const linter = new Linter();
  const config = {
    files: ['**/*.ts'],
    plugins: { local: { rules: { 'canonical-import-paths': rule } } },
    rules: { 'local/canonical-import-paths': 'error' },
  } satisfies Linter.Config;

  const expectIdempotent = (
    input: string,
    inputFile: string,
    expected: string,
  ): void => {
    const once = linter.verifyAndFix(input, config, inputFile).output;
    const twice = linter.verifyAndFix(once, config, inputFile).output;

    expect(once).toBe(expected);
    expect(twice).toBe(once);
  };

  it('is idempotent for app-relative imports', () => {
    const input = `import Button from '../components/Button.vue';`;
    const messages = linter.verify(
      input,
      config,
      filename('app/services/example.ts'),
    );
    expect(messages).toHaveLength(1);
    expect(messages[0]?.fix).toBeDefined();

    expectIdempotent(
      input,
      filename('app/services/example.ts'),
      `import Button from '~/components/Button.vue';`,
    );
  });

  it('is idempotent for testUtils alias normalization', () => {
    expectIdempotent(
      `import { MailpitService } from '#test/testUtils/MailpitService';`,
      filename('test/testServices.ts'),
      `import { MailpitService } from '#test/MailpitService';`,
    );
  });

  it('is idempotent when TypeScript extension substitution is ambiguous', () => {
    const originalModule = resolve(root, 'test/testUtils/safety.js');
    const competingModule = resolve(root, 'test/safety.ts');
    const input = `import safety from '#test/testUtils/safety.js';`;
    mockedFiles.add(originalModule);
    mockedFiles.add(competingModule);

    try {
      expectIdempotent(input, filename('test/testServices.ts'), input);
    } finally {
      mockedFiles.delete(originalModule);
      mockedFiles.delete(competingModule);
    }
  });

  it('is idempotent for directory and index imports', () => {
    const input = [
      `import directory from '../utils';`,
      `import index from '../utils/index.js';`,
    ].join('\n');

    expectIdempotent(
      input,
      filename('app/services/example.ts'),
      [
        `import directory from '~/utils';`,
        `import index from '~/utils/index.js';`,
      ].join('\n'),
    );
  });

  it('is idempotent for imports with query and hash suffixes', () => {
    const input = [
      `import raw from '../utils/file.js?raw';`,
      `import fragment from '../utils/file.js#fragment';`,
    ].join('\n');

    expectIdempotent(
      input,
      filename('app/services/example.ts'),
      [
        `import raw from '~/utils/file.js?raw';`,
        `import fragment from '~/utils/file.js#fragment';`,
      ].join('\n'),
    );
  });

  it('is idempotent when no alias exists for the target', () => {
    const input = `import helper from './helper';`;

    expectIdempotent(input, filename('nuxt.config.ts'), input);
  });
});
