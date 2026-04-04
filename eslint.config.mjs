import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // Allow setState in effects for legitimate async/subscription patterns
  {
    files: [
      "src/components/layout/theme-toggle.tsx",
      "src/components/layout/nav.tsx",
      "src/components/auth/sign-in-modal.tsx",
      "src/components/home/stats-section.tsx",
      "src/hooks/use-items.ts",
      "src/hooks/use-notifications.ts",
    ],
    rules: {
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
