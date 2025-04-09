/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

// Define Vitest configuration
export default defineConfig({
  plugins: [vue()], 
  test: {
    globals: true, 
    environment: 'jsdom', 
  }
})