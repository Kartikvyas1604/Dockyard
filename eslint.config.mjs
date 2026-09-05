import { defineConfig, globalIgnores } from "eslint/config";

/**
 * Root flat config for packages/* and apps/mobile|extension.
 * apps/web has its own Next.js config and is excluded here.
 */
export default defineConfig([
  globalIgnores([
    "**/node_modules/**",
    "**/dist/**",
    "**/.next/**",
    "**/.turbo/**",
    "apps/web/**",
  ]),
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
