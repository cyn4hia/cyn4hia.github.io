import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Change '/green-grapes/' to match your GitHub repo name
  base: "/green-grapes/",
});
