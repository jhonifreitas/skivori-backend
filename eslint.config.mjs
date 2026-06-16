// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "prettier/prettier": ["warn", { endOfLine: "auto" }],
      "@typescript-eslint/naming-convention": [
        "warn",
        {
          "selector": "typeLike",
          "format": ["PascalCase"]
        },
        {
          "selector": "typeAlias",
          "format": ["PascalCase"],
          "prefix": ["T"]
        },
        {
          "selector": "typeParameter",
          "format": ["PascalCase"],
          "prefix": ["T"]
        },
        {
          "selector": "interface",
          "format": ["PascalCase"],
          "prefix": ["I"]
        },
        {
          "selector": "enum",
          "format": ["UPPER_CASE", "PascalCase"],
          "trailingUnderscore": "allow"
        },
        {
          "selector": "enumMember",
          "format": ["UPPER_CASE", "PascalCase"],
          "trailingUnderscore": "allow"
        }
      ]
    },
  },
);
