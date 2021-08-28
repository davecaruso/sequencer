// eslint configuration. this is the one file that is not a ES module
// see https://github.com/typescript-eslint/typescript-eslint/blob/master/docs/getting-started/linting/README.md

/** @type {import("eslint").Linter.Config} */
// eslint-disable-next-line no-undef
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  globals: {
    __DEV__: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  rules: {
    // i prefer to run prettier separatly
    'prettier/prettier': 'off',
    // i find these anoying because they underline stuff while youre making it.
    // TODO: set this using a dynamic variable so we can run these checks at
    //       build time but not in the ide.
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-unused-vars': 'off',

    // change some errors to warnings
    'prefer-const': 'warn',

    // reduce checking
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
  },
};
