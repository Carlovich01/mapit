import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Necesario para Docker
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true, // Necesario para Docker en Windows/Mac
    },
  },
});
