import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/Tic-Tac-Toe/",   // Configuración para GitHub Pages
});