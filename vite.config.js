import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

// Hai chế độ build:
//  - SINGLE=1  → gói tất cả vào 1 file index.html (mở bằng trình duyệt là chạy)
//  - GHPAGES=1 → build cho GitHub Pages (đặt base theo tên repo)
const SINGLE = process.env.SINGLE === "1";
const GHPAGES = process.env.GHPAGES === "1";

export default defineConfig({
  base: SINGLE ? "./" : GHPAGES ? "/Sale-CRM-psv/" : "/",
  plugins: [react(), ...(SINGLE ? [viteSingleFile()] : [])],
  server: { port: 5173, open: true },
});
