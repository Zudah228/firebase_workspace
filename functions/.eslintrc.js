/* eslint-disable quote-props */
module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "google",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["tsconfig.json", "tsconfig.dev.json"],
    sourceType: "module",
  },
  ignorePatterns: [
    "/lib/**/*", // Ignore built files.
    "/node_modules/**",
  ],
  plugins: ["@typescript-eslint", "import", "prettier"],
  rules: {
    "no-console": ["warn", { allow: ["error", "warn"] }],
    "no-debugger": "error",
    "no-trailing-spaces": "warn",
    "generator-star-spacing": ["warn", { before: false, after: true }],
    "@typescript-eslint/no-empty-function": ["warn", { allow: ["private-constructors", "protected-constructors"] }],
    "prettier/prettier": "warn",
    "no-var": "error",
    "prefer-const": "warn",
    indent: ["warn", 2],
    semi: ["error", "always"],
    "max-len": [
      "warn",
      {
        code: 140,
      },
    ],
    "no-irregular-whitespace": [
      "error",
      {
        skipStrings: true,
        skipComments: true,
        skipRegExps: true,
        skipTemplates: true,
      },
    ],
    quotes: ["warn", "double"],
    "object-curly-spacing": ["warn", "always"],
    "import/no-unresolved": 0,
    "import/prefer-default-export": 0,
    "valid-jsdoc": [0],
    "require-jsdoc": [
      "warn",
      {
        require: {
          FunctionDeclaration: false,
          MethodDefinition: false,
          ClassDeclaration: true,
          ArrowFunctionExpression: false,
          FunctionExpression: false,
        },
      },
    ],
    capIsNew: 0,
    capIsNewExceptions: 0,
  },
};
