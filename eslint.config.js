// @ts-check
import globals from "globals"
import eslint from "@eslint/js"
import eslintPluginAstro from "eslint-plugin-astro"
import stylistic from "@stylistic/eslint-plugin"
import cspellESLintPluginRecommended from "@cspell/eslint-plugin/recommended"
import tseslint from "typescript-eslint"

export default [
  eslint.configs.recommended,
  cspellESLintPluginRecommended,
  ...eslintPluginAstro.configs.recommended,
  stylistic.configs.customize({
    indent: 2,
    quotes: "double",
    semi: false,
    jsx: true,
  }),
  {
    files: ["*.{ts,tsx}"],
    parser: "@typescript-eslint/parser",
  },
  ...[
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
  ].map(conf => ({
    ...conf,
    files: ["**/*.{ts,tsx}"],
  })),
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      "@stylistic": stylistic,
    },
    rules: {
      "@stylistic/jsx-one-expression-per-line": ["off"],
      "@cspell/spellchecker": [
        "warn",
        {
          configFile: new URL("./cspell.json", import.meta.url).toString(),
        },
      ],
      "prefer-const": [
        "error",
        {
          destructuring: "any",
          ignoreReadBeforeAssign: false,
        },
      ],
    },
  },
  {
    ignores: [
      "dist/**/*",
      "public/**/*",
      "node_modules/**/*",
      "src/utils/active/**/*",
      "openapi-ts.active.config.ts",
      "src/env.d.ts",
    ],
  },
]
