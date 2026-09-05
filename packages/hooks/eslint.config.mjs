import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";

export default defineConfig([
  globalIgnores(["dist/**", "node_modules/**"]),
  ...tseslint.configs.recommended,
  {
    plugins: { "react-hooks": reactHooks },
    rules: reactHooks.configs.recommended.rules,
  },
  {
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "Literal[value=/:^#[0-9a-fA-F]{3,8}$/]",
          message: "Hardcoded hex color — use design tokens from @dockyard/ui.",
        },
      ],
    },
  },
]);
