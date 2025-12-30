import { execSync } from "node:child_process";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const getLastDataUpdate = () => {
  try {
    const date = execSync("git log -1 --format=%cI -- data/streets.json")
      .toString()
      .trim();
    return date || null;
  } catch {
    return null;
  }
};

// https://vite.dev/config/
export default defineConfig({
  define: {
    __DATA_LAST_UPDATED__: JSON.stringify(getLastDataUpdate()),
  },
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
  ],
});
