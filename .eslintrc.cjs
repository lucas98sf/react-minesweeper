module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:react/jsx-runtime',
    'eslint-config-prettier',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'simple-import-sort', 'functional'],
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    'import/prefer-default-export': 'off',
    'no-param-reassign': ['error', { props: true }],
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
    ],
    curly: ['error', 'all'],
    // 'functional/immutable-data': [
    //   'error',
    //   {
    //     ignorePattern: ['state', 'gameState', 'current', 'value'],
    //     ignoreClasses: 'fieldsOnly',
    //     assumeTypes: {
    //       forArrays: false,
    //       forObjects: true,
    //     },
    //   },
    // ],
  },
};
