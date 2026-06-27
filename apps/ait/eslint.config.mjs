import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';

/** @type {import('eslint').Linter.Config[]} */
export default [
  { ignores: ['**/node_modules/**', '**/dist/**', '**/.granite/**', 'src/vendor/**', 'src/router.gen.ts', '*.{cjs,js}'] },
  { files: ['pages/**/*.{ts,jsx,tsx}', 'src/**/*.{ts,jsx,tsx}'] },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  pluginReact.configs.flat.recommended,
  // RN 0.84 + React 19는 automatic JSX runtime이라 `import React`가 필요 없습니다.
  pluginReact.configs.flat['jsx-runtime'],
];
