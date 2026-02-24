import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 添加下面这段 server 配置
  server: {
    host: '0.0.0.0', // 强制监听所有 IP
  }
})
