import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores(["dist/**", "node_modules/**"]),
  ...tseslint.configs.recommended,
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
