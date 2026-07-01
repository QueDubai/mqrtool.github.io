import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 项目站点：https://quedubai.github.io/mqrtool.github.io/
export default defineConfig({
  plugins: [vue()],
  base: '/mqrtool.github.io/',
})
