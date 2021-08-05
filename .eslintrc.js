module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'airbnb-base'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: [
    '@typescript-eslint'
  ],
  rules: {
    'no-console': 0,
    'import/no-extraneous-dependencies': 0,
    'import/prefer-default-export': 0,
    'no-unused-vars': 'off',
    'import/no-unresolved': 0,
    'import/extensions': 0,
    'class-methods-use-this': 0,
    'comma-dangle': ['error', 'never'],
    'lines-between-class-members': 0,
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': ['error'],
    '@typescript-eslint/no-unused-vars': 'warn',
    'no-param-reassign': 'off'
  }
};
