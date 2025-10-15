import antfu from "@antfu/eslint-config";

export default antfu({
  type: "app",
  typescript: true,
  formatters: true,
  stylistic: {
    indent: 2,
    semi: true,
    quotes: "double",
  },
  ignores: ["**/migrations/*", "README.md"],
}, {
  rules: {
    "@stylistic/brace-style": ["error", "1tbs", { allowSingleLine: true }],
    "no-console": ["warn"],
    "antfu/no-top-level-await": ["off"],
    "antfu/top-level-function": ["off"],
    "node/prefer-global/process": ["off"],
    "node/no-process-env": ["error"],
    "perfectionist/sort-imports": ["error", {
      tsconfigRootDir: ".",
    }],
    "unicorn/filename-case": ["error", {
      case: "kebabCase",
      ignore: ["README.md"],
    }],
  },
});
