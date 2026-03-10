import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import noNullPlugin from "eslint-plugin-no-null";
import promisePlugin from "eslint-plugin-promise";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import reactThreePlugin from "@react-three/eslint-plugin";
import globals from "globals";

export default [
  {
    linterOptions: {
      reportUnusedDisableDirectives: false,
    },
  },
  {
    ignores: [
      "hacks.d.ts",
      "frontend/hacks.d.ts",
      ".eslintrc.js",
      "frontend/wizard/step.tsx",
      "scripts/fps.js",
    ],
  },
  {
    ...js.configs.recommended,
    files: ["frontend/**/*.{ts,tsx}", "public/app-resources/languages/**/*.{ts,tsx}"],
  },
  {
    files: ["frontend/**/*.{ts,tsx}", "public/app-resources/languages/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ["tsconfig.eslint.json"],
        sourceType: "module",
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      "no-null": noNullPlugin,
      promise: promisePlugin,
      "react-hooks": reactHooksPlugin,
      "@react-three": reactThreePlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...tsPlugin.configs["recommended-type-checked"].rules,
      ...promisePlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      ...reactThreePlugin.configs.recommended.rules,
      "@typescript-eslint/await-thenable": "off",
      "@typescript-eslint/consistent-type-assertions": "error",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/naming-convention": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-inferrable-types": "error",
      "@typescript-eslint/no-namespace": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-var-requires": "off",
      "@typescript-eslint/prefer-namespace-keyword": "error",
      "@typescript-eslint/prefer-promise-reject-errors": "off",
      "@typescript-eslint/prefer-regexp-exec": "off",
      "@typescript-eslint/restrict-plus-operands": "off",
      "@typescript-eslint/restrict-template-expressions": "off",
      "@typescript-eslint/unbound-method": "off",
      "array-bracket-spacing": "error",
      "block-spacing": "error",
      "brace-style": [
        "error",
        "1tbs",
        {
          allowSingleLine: true,
        },
      ],
      "comma-dangle": [
        "error",
        {
          objects: "only-multiline",
          arrays: "always-multiline",
          functions: "always-multiline",
          imports: "always-multiline",
        },
      ],
      "comma-spacing": "error",
      "comma-style": "error",
      complexity: [
        "error",
        {
          max: 14,
        },
      ],
      "computed-property-spacing": "error",
      curly: "error",
      "eol-last": "error",
      "func-call-spacing": "error",
      indent: [
        "error",
        2,
        {
          SwitchCase: 1,
        },
      ],
      "key-spacing": "error",
      "keyword-spacing": "error",
      quotes: [
        "error",
        "double",
        {
          avoidEscape: true,
        },
      ],
      "max-len": [
        "error",
        {
          code: 100,
        },
      ],
      "multiline-ternary": ["error", "always-multiline"],
      "no-bitwise": "error",
      "no-caller": "error",
      "no-case-declarations": "off",
      "no-cond-assign": "error",
      "no-duplicate-imports": "error",
      "no-eval": "error",
      "no-fallthrough": "error",
      "no-undef": "off",
      "no-multi-spaces": "error",
      "no-multiple-empty-lines": "error",
      "no-nested-ternary": "error",
      "no-null/no-null": "error",
      "no-prototype-builtins": "off",
      "no-redeclare": "error",
      "no-shadow": "off",
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "JSXOpeningElement > JSXSpreadAttribute ~ JSXAttribute[name.name='key']",
          message:
            "Place `key` before JSX spread props (or pass it directly), e.g. " +
            "`<Comp key={id} {...props} />`.",
        },
      ],
      "no-trailing-spaces": "error",
      "no-unneeded-ternary": "error",
      "no-var": "error",
      "no-whitespace-before-property": "error",
      "object-curly-spacing": [
        "error",
        "always",
      ],
      "prefer-const": "error",
      "promise/always-return": "off",
      "promise/catch-or-return": "off",
      "promise/no-callback-in-promise": "off",
      "promise/no-return-wrap": "off",
      semi: "error",
      "space-in-parens": "error",
      "space-infix-ops": "error",
      "space-unary-ops": "error",
      "spaced-comment": [
        "error",
        "always",
        {
          markers: ["/"],
        },
      ],
      "use-isnan": "error",
      "@typescript-eslint/no-unsafe-enum-comparison": "off",
      "@typescript-eslint/no-duplicate-enum-values": "off",
      "@typescript-eslint/no-base-to-string": "off",
      "@typescript-eslint/no-redundant-type-constituents": "off",
    },
  },
];
