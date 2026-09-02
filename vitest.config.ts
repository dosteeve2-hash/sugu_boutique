import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

/**
 * Ce fichier n'existait pas : sans lui, Vitest ne résolvait ni l'alias « @ »
 * du tsconfig ni l'environnement jsdom, et les deux suites de tests
 * échouaient au chargement (« Failed to load url @/app/... »). Aucun test du
 * dépôt n'avait donc jamais pu s'exécuter.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Aligné sur `paths` du tsconfig : "@/*" -> "./*"
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    pool: "forks",
  },
});
