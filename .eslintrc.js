module.exports = {
    env: {
        browser: true,
        node: true
    },
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: ["tsconfig.json", "tsconfig.dev.json"],
        sourceType: "module",
    },
    plugins: [
        "@typescript-eslint",
        "eslint-comments",
        "jest",
        "react",
        "no-null",
        "import",
        "promise",
        "@react-three",
    ],
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "plugin:eslint-comments/recommended",
        "plugin:jest/recommended",
        "plugin:promise/recommended",
        "plugin:react/recommended",
        "plugin:react-hooks/recommended",
        "plugin:import/errors",
        "plugin:import/warnings",
        "plugin:import/typescript",
        "plugin:@react-three/recommended",
    ],
    settings: {
        react: {
            version: "detect"
        }
    },
    rules: {
        "@typescript-eslint/await-thenable": "off",
        "@typescript-eslint/ban-types": "off",
        "@typescript-eslint/consistent-type-assertions": "error",
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/naming-convention": "off",
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/no-explicit-any": "error",
        "@typescript-eslint/no-floating-promises": "off",
        "@typescript-eslint/no-inferrable-types": "error",
        "@typescript-eslint/no-namespace": "off",
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/no-unsafe-call": "off",
        "@typescript-eslint/no-unsafe-member-access": "off",
        "@typescript-eslint/no-unsafe-return": "off",
        "@typescript-eslint/no-unused-vars": [
            "error",
            {
                varsIgnorePattern: "^_",
                argsIgnorePattern: "^_",
            }
        ],
        "@typescript-eslint/no-var-requires": "off",
        "@typescript-eslint/prefer-namespace-keyword": "error",
        "@typescript-eslint/prefer-regexp-exec": "off",
        "@typescript-eslint/quotes": [
            "error",
            "double",
            {
                avoidEscape: true,
            }
        ],
        "@typescript-eslint/restrict-plus-operands": "off",
        "@typescript-eslint/restrict-template-expressions": "off",
        "@typescript-eslint/type-annotation-spacing": "error",
        "@typescript-eslint/unbound-method": "off",
        "array-bracket-spacing": "error",
        "block-spacing": "error",
        "brace-style": [
            "error",
            "1tbs",
            {
                allowSingleLine: true,
            }
        ],
        "comma-dangle": [
            "error",
            {
                objects: "only-multiline",
                arrays: "always-multiline",
                functions: "always-multiline",
                imports: "always-multiline",
            }
        ],
        "comma-spacing": "error",
        "comma-style": "error",
        "complexity": [
            "error",
            {
                max: 14,
            }
        ],
        "computed-property-spacing": "error",
        "curly": "error",
        "eol-last": "error",
        "eslint-comments/disable-enable-pair": "off",
        "func-call-spacing": "error",
        "import/no-default-export": "error",
        "import/no-deprecated": "error",
        "indent": [
            "error",
            2,
            {
                SwitchCase: 1,
            }
        ],
        "jest/expect-expect": "off",
        "jest/no-conditional-expect": "off",
        "key-spacing": "error",
        "keyword-spacing": "error",
        "max-len": [
            "error",
            {
                code: 100,
            }
        ],
        "multiline-ternary": [
            "error", "always-multiline"],
        "no-bitwise": "error",
        "no-caller": "error",
        "no-case-declarations": "off",
        "no-cond-assign": "error",
        "no-duplicate-imports": "error",
        "no-eval": "error",
        "no-fallthrough": "error",
        "no-multi-spaces": "error",
        "no-multiple-empty-lines": "error",
        "no-nested-ternary": "error",
        "no-null/no-null": "error",
        "no-prototype-builtins": "off",
        "no-redeclare": "error",
        "no-shadow": "off",
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
        "react/display-name": "off",
        "react/jsx-key": "off",
        "react/prop-types": "off",
        "semi": "error",
        "space-in-parens": "error",
        "space-infix-ops": "error",
        "space-unary-ops": "error",
        "spaced-comment": [
            "error",
            "always",
            {
                markers: ["/"],
            }
        ],
        "use-isnan": "error",
        "@typescript-eslint/no-unsafe-enum-comparison": "off",
        "@typescript-eslint/no-duplicate-enum-values": "off",
        "@typescript-eslint/no-base-to-string": "off",
        "@typescript-eslint/no-redundant-type-constituents": "off",
    }
};
