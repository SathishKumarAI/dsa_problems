import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { apiPlugin } from "./server/vite-api.ts"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), apiPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
})
