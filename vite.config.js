import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Cho phép Vite xử lý cú pháp JSX trong file .jsx (mặc định đã hỗ trợ)
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
});
