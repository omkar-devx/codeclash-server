import { defineConfig } from 'eslint/config';
import globals from 'globals';
import js from '@eslint/js';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default defineConfig({
  files: ['**/*.{js,mjs,cjs}'],
  plugins: {
    prettier: prettierPlugin,
  },
  languageOptions: {
    globals: globals.node,
  },
  rules: {
    ...js.configs.recommended.rules,
    ...prettierConfig.rules,
    'prettier/prettier': 'error',
  },
});
