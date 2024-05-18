// ts-check
import globals from "globals"
import eslint from "@eslint/js"
import eslintPluginAstro from "eslint-plugin-astro"
import stylistic from "@stylistic/eslint-plugin"

export default [
  eslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  stylistic.configs.customize({
    indent: 2,
    quotes: "double",
    semi: false,
    jsx: true,
  }),
  {
    ignores: ["dist"],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      "prefer-const": [
        "error",
        {
          destructuring: "any",
          ignoreReadBeforeAssign: false,
        },
      ],
    },
  },
]
