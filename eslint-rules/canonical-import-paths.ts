import { existsSync, readdirSync } from 'node:fs';
import {
  basename,
  dirname,
  isAbsolute,
  relative,
  resolve,
  sep,
} from 'node:path';
import { fileURLToPath } from 'node:url';

import type { Rule } from 'eslint';
import type * as ESTree from 'estree';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const testRoot = resolve(projectRoot, 'test');
const testUtilsRoot = resolve(testRoot, 'testUtils');
const testModuleExtensions = [
  '.ts',
  '.tsx',
  '.vue',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.mts',
  '.cts',
  '.json',
  '.d.ts',
];
const typeScriptExtensionSubstitutions: Record<string, readonly string[]> = {
  '.js': ['.ts', '.tsx', '.d.ts'],
  '.jsx': ['.tsx', '.d.ts'],
  '.mjs': ['.mts', '.d.mts'],
  '.cjs': ['.cts', '.d.cts'],
};

interface Alias {
  name: string;
  root: string;
}

const aliases: Alias[] = [
  { name: '#shared', root: resolve(projectRoot, 'shared') },
  { name: '#server', root: resolve(projectRoot, 'server') },
  { name: '#test', root: resolve(projectRoot, 'test') },
  { name: '~', root: resolve(projectRoot, 'app') },
];

const knownRootAliases = new Map(
  aliases
    .filter(({ name }) => name.startsWith('#'))
    .map(({ name, root }) => [name.slice(1), root]),
);

const testUtilsPrefix = '#test/testUtils';

const isTestUtilsSpecifier = (specifier: string): boolean => {
  const { path } = splitSuffix(specifier);
  return path === testUtilsPrefix || path.startsWith(`${testUtilsPrefix}/`);
};

const isBannedSpecifier = (specifier: string): boolean =>
  /^\.\.?(?:\/|$)/.test(specifier) ||
  specifier.startsWith('~~/') ||
  isTestUtilsSpecifier(specifier);

const getStaticSpecifier = (
  node: ESTree.Node | undefined,
): string | undefined => {
  if (node?.type === 'Literal' && typeof node.value === 'string') {
    return node.value;
  }
  if (node?.type === 'TemplateLiteral' && node.expressions.length === 0) {
    return node.quasis[0]?.value.cooked ?? undefined;
  }
  return undefined;
};

const splitSuffix = (specifier: string) => {
  const aliasPrefixLength = specifier.startsWith('#') ? 1 : 0;
  const suffixIndex = specifier.slice(aliasPrefixLength).search(/[?#]/);
  if (suffixIndex === -1) return { path: specifier, suffix: '' };
  const absoluteSuffixIndex = suffixIndex + aliasPrefixLength;
  return {
    path: specifier.slice(0, absoluteSuffixIndex),
    suffix: specifier.slice(absoluteSuffixIndex),
  };
};

const isWithinDirectory = (directory: string, target: string): boolean => {
  const subpath = relative(directory, target);
  return (
    subpath === '' ||
    (subpath !== '..' &&
      !subpath.startsWith(`..${sep}`) &&
      !isAbsolute(subpath))
  );
};

const hasModuleAtPath = (target: string): boolean => {
  const substitutions = Object.entries(typeScriptExtensionSubstitutions).find(
    ([extension]) => target.endsWith(extension),
  );
  const substitutedPaths = substitutions
    ? substitutions[1].map((extension) =>
        target.slice(0, -substitutions[0].length).concat(extension),
      )
    : [];

  return [
    target,
    ...testModuleExtensions.map((extension) => `${target}${extension}`),
    ...substitutedPaths,
  ].some(existsSync);
};

const hasCompetingModuleAtPath = (target: string): boolean => {
  if (existsSync(target)) return true;

  const directory = dirname(target);
  if (!existsSync(directory)) return false;

  const getStem = (fileName: string): string => {
    const firstExtension = fileName.indexOf(
      '.',
      fileName.startsWith('.') ? 1 : 0,
    );
    return firstExtension === -1 ? fileName : fileName.slice(0, firstExtension);
  };
  const targetStem = getStem(basename(target)).toLowerCase();

  try {
    return readdirSync(directory, { encoding: 'utf8' }).some(
      (fileName) => getStem(fileName).toLowerCase() === targetStem,
    );
  } catch {
    return true;
  }
};

const toTestUtilsAliasSpecifier = (target: string): string | undefined => {
  const absoluteTarget = resolve(target);
  if (!isWithinDirectory(testUtilsRoot, absoluteTarget)) return undefined;
  if (!hasModuleAtPath(absoluteTarget)) return undefined;

  const subpath = relative(testUtilsRoot, absoluteTarget);
  const higherPriorityTarget = resolve(testRoot, subpath);
  if (hasCompetingModuleAtPath(higherPriorityTarget)) return undefined;

  const normalizedSubpath = subpath.split(sep).join('/');
  return normalizedSubpath ? `#test/${normalizedSubpath}` : '#test';
};

const toAliasSpecifier = (target: string): string | undefined => {
  const absoluteTarget = resolve(target);
  if (isWithinDirectory(testUtilsRoot, absoluteTarget)) {
    return toTestUtilsAliasSpecifier(absoluteTarget);
  }

  for (const { name, root } of aliases) {
    const subpath = relative(root, absoluteTarget);
    if (
      subpath === '..' ||
      subpath.startsWith(`..${sep}`) ||
      isAbsolute(subpath)
    ) {
      continue;
    }

    const normalizedSubpath = subpath.split(sep).join('/');
    return normalizedSubpath ? `${name}/${normalizedSubpath}` : name;
  }

  return undefined;
};

const resolveSpecifier = (
  specifier: string,
  importingFile: string,
): string | undefined => {
  const { path, suffix } = splitSuffix(specifier);
  if (isTestUtilsSpecifier(specifier)) {
    const subpath =
      path === testUtilsPrefix ? '' : path.slice(testUtilsPrefix.length + 1);
    const aliasSpecifier = toTestUtilsAliasSpecifier(
      resolve(testUtilsRoot, subpath),
    );
    return aliasSpecifier ? `${aliasSpecifier}${suffix}` : undefined;
  }

  let target: string;

  if (path.startsWith('~~/')) {
    const rootRelativePath = path.slice(3);
    const pathParts = rootRelativePath.split('/');
    const rootName = pathParts[0] ?? '';
    const remainingPath = pathParts.slice(1);
    const aliasRoot = knownRootAliases.get(rootName);
    if (aliasRoot) {
      target = resolve(aliasRoot, ...remainingPath);
    } else {
      target = resolve(projectRoot, rootRelativePath);
    }
  } else {
    target = resolve(dirname(importingFile), path);
  }

  const aliasSpecifier = toAliasSpecifier(target);
  return aliasSpecifier ? `${aliasSpecifier}${suffix}` : undefined;
};

const isStaticMockCall = (callee: ESTree.Node): boolean => {
  if (callee.type !== 'MemberExpression') return false;
  if (callee.object.type !== 'Identifier') return false;
  if (!['vi', 'jest'].includes(callee.object.name)) return false;

  const propertyName = callee.computed
    ? getStaticSpecifier(callee.property)
    : callee.property.type === 'Identifier'
      ? callee.property.name
      : undefined;

  return (
    propertyName !== undefined && ['mock', 'doMock'].includes(propertyName)
  );
};

interface TypeScriptImportTypeNode extends ESTree.BaseNode {
  type: 'TSImportType';
  source: ESTree.Literal;
}

type TypeScriptModuleReference =
  | {
      type: 'TSExternalModuleReference';
      expression: ESTree.Expression;
    }
  | { type: 'TSQualifiedName' };

interface TypeScriptImportEqualsNode extends ESTree.BaseNode {
  type: 'TSImportEqualsDeclaration';
  moduleReference: TypeScriptModuleReference;
}

export const canonicalImportPaths: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Ban relative, ~~ and #test/testUtils imports; fix only when the target can be represented safely.',
    },
    fixable: 'code',
    schema: [],
    messages: {
      useAlias:
        'Use a canonical # alias instead of this relative path, ~~ alias, or #test/testUtils path: "{{specifier}}".',
    },
  },
  create(context) {
    const importingFile = resolve(context.filename);

    const checkSpecifier = (
      node: ESTree.Node | undefined,
      specifier: string | undefined,
    ): void => {
      if (typeof specifier !== 'string' || !isBannedSpecifier(specifier)) {
        return;
      }

      const replacement = resolveSpecifier(specifier, importingFile);
      if (!node) return;

      context.report({
        node,
        messageId: 'useAlias',
        data: { specifier },
        ...(replacement
          ? {
              fix(fixer) {
                const rawText = context.sourceCode.getText(node);
                const quote = rawText[0];
                if (quote !== '"' && quote !== "'" && quote !== '`') {
                  return null;
                }
                if (
                  replacement.includes('\\') ||
                  replacement.includes(quote) ||
                  containsControlCharacter(replacement) ||
                  (quote === '`' && replacement.includes('${'))
                ) {
                  return null;
                }
                return fixer.replaceText(
                  node,
                  `${quote}${replacement}${quote}`,
                );
              },
            }
          : {}),
      });
    };

    const checkSource = (node: ESTree.Node | undefined): void => {
      checkSpecifier(node, getStaticSpecifier(node));
    };

    const listeners: Rule.RuleListener = {
      ImportDeclaration(node) {
        checkSource(node.source);
      },
      ExportNamedDeclaration(node) {
        if (node.source) checkSource(node.source);
      },
      ExportAllDeclaration(node) {
        checkSource(node.source);
      },
      ImportExpression(node) {
        checkSource(node.source);
      },
      CallExpression(node) {
        const calleeType: string = node.callee.type;
        if (
          calleeType === 'Import' ||
          (node.callee.type === 'Identifier' && node.callee.name === 'require')
        ) {
          checkSource(node.arguments[0]);
          return;
        }
        if (isStaticMockCall(node.callee)) {
          checkSource(node.arguments[0]);
        }
      },
    };

    return Object.assign(listeners, {
      TSImportType(node: TypeScriptImportTypeNode) {
        checkSource(node.source);
      },
      TSImportEqualsDeclaration(node: TypeScriptImportEqualsNode) {
        if (node.moduleReference.type === 'TSExternalModuleReference') {
          checkSource(node.moduleReference.expression);
        }
      },
    });
  },
};

const containsControlCharacter = (value: string): boolean => {
  for (const character of value) {
    const codePoint = character.charCodeAt(0);
    if (codePoint < 0x20 || codePoint === 0x7f) return true;
  }
  return false;
};

export default {
  rules: {
    'canonical-import-paths': canonicalImportPaths,
  },
};
