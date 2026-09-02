import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Electron dosyadan yüklediği için göreli yol şart
  base: "./",
  server: {
    port: 5113,
  },
});
