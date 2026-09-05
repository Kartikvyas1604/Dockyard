/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["next/core-web-vitals", "prettier"],
  ignorePatterns: ["dist/**", ".next/**", "node_modules/**"],
  rules: {
    "no-restricted-syntax": [
      "error",
      {
        selector: "Literal[value=/:^#[0-9a-fA-F]{3,8}$/]",
        message: "Hardcoded hex color — use design tokens from @dockyard/ui.",
      },
    ],
  },
};
