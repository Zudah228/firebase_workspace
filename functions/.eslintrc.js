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
    "jest.config.js",
    "babel.config.js",
  ],
  plugins: ["@typescript-eslint", "import", "unused-imports", "prettier"],
  rules: {
    "no-console": ["warn", { allow: ["error", "warn", "info"] }],
    "no-debugger": "error",
    "generator-star-spacing": ["warn", { before: false, after: true }],
    "@typescript-eslint/no-empty-function": ["warn", { allow: ["private-constructors", "protected-constructors"] }],
    "prettier/prettier": [
      "warn",
      {
        semi: true,
        singleQuote: false,
        trailingComma: "es5",
        printWidth: 120,
        tabWidth: 2,
        bracketSpacing: true,
        bracketSameLine: true,
        useTabs: false,
      },
      {
        usePrettierrc: true,
      },
    ],
    "no-var": "error",
    "prefer-const": "warn",
    "padded-blocks": [
      "off",
      {
        blocks: "always",
        classes: "always",
        switches: "never",
      },
    ],
    "no-trailing-spaces": "warn",
    indent: ["warn", 2],
    semi: ["warn", "always"],
    "max-len": [
      "warn",
      {
        code: 120,
        ignoreStrings: true,
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
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "import/order": [
      "warn",
      {
        groups: ["builtin", "external", ["internal", "parent", "sibling", "index", "object", "type"]],
        "newlines-between": "always",
        pathGroupsExcludedImportTypes: ["builtin"],
        alphabetize: { order: "asc", caseInsensitive: true },
        pathGroups: [{ pattern: "src/config.ts", group: "external", position: "before" }],
      },
    ],
    "import/no-unresolved": 0,
    "import/prefer-default-export": 0,
    "unused-imports/no-unused-imports": "warn",
    "keyword-spacing": "warn",
    "no-empty": "warn",
    "space-before-function-paren": "off",
    "brace-style": "off",
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
