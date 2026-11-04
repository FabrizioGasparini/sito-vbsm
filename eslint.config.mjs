import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import globals from "globals";

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

const config = [
  {
    ignores: [".next/**", "node_modules/**", "public/**", "next-env.d.ts", "app/admin/matches/page.txt"],
  },
  // Regole ufficiali Next.js (React, hooks, Core Web Vitals) + TypeScript
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Le immagini sono servite da una cartella esterna con percorsi dinamici: <img> è una scelta voluta
      "@next/next/no-img-element": "off",
    },
  },
  {
    // Script Node.js di supporto (deploy, compressione immagini, configurazione)
    files: ["*.js", "*.mjs"],
    languageOptions: { globals: globals.node },
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
];

export default config;
