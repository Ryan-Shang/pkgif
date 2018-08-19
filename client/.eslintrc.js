module.exports = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint',
    ecmaVersion: 9,
    sourceType: 'module',
  },
  env: {
    browser: true,
  },
  extends: [ 'plugin:vue/essential', 'eslint-config-egg' ],
  plugins: [
    'vue',
  ],
  rules: {
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'vue/no-parsing-error': [ 2, { 'x-invalid-end-tag': false }],
    'linebreak-style': 'off',
  },
};
