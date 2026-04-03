import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import unusedImports from "eslint-plugin-unused-imports";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // 👇 Add a rules override for all source files
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",
      "unused-imports/no-unused-imports": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: '^_' }],
      "react/no-unescaped-entities": "off"
    }
  }
  
];

export default eslintConfig;
