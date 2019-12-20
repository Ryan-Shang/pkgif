module.exports = {
  root: true,
  env: {
    browser: true,
  },
  extends: [ 'plugin:vue/recommended', 'eslint-config-egg' ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'linebreak-style': 'off',
    'vue/html-indent': [ 'error', 4 ],
  },
  parserOptions: {
    parser: 'babel-eslint',
    ecmaVersion: 9,
    sourceType: 'module',
  },
};
