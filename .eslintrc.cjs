module.exports = {
  root: true,
  env: {
    es2022: true,
    node: true,
    browser: true
  },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  },
  extends: ["eslint:recommended", "prettier"],
  ignorePatterns: [
    "dist",
    "build",
    ".next",
    "node_modules",
    "coverage"
  ]
};
