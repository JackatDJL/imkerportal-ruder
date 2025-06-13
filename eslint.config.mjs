// eslint.config.mjs
import { FlatCompat } from "@eslint/eslintrc";
import tseslint from "typescript-eslint";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended"; // New import for flat config

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

export default tseslint.config(
  {
    ignores: [".next", "node_modules", "dist"], // Add common ignore paths
  },
  // Apply the base Next.js config first
  ...compat.extends("next/core-web-vitals"),
  {
    // Configuration for TypeScript files
    files: ["**/*.ts", "**/*.tsx"],
    extends: [
      ...tseslint.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
      // You might also want to add React hooks rules here
      // ...compat.extends('plugin:react-hooks/recommended'), // If you need this explicitly
    ],
    rules: {
      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: { attributes: false } },
      ],
      "import/no-anonymous-default-export": "off",
      // Add a specific rule if you want to enforce Prettier directly in ESLint
      // This is included in 'eslint-plugin-prettier/recommended', but you can override:
      // 'prettier/prettier': 'error',
    },
    languageOptions: {
      parserOptions: {
        projectService: true, // Enable type-aware linting
        tsconfigRootDir: import.meta.dirname, // Important for resolving tsconfig
      },
    },
  },
  // This is the crucial part for Prettier integration:
  // It adds the 'prettier/prettier' rule and disables conflicting ESLint rules.
  // It MUST come last to ensure it overrides other formatting rules.
  // eslintPluginPrettierRecommended,
  {
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    rules: {
      // "prettier/prettier": "off",
    },
  },
);
