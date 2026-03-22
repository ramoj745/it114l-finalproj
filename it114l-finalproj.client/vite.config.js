import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 54971,
        proxy: {
            '/api': {
                target: 'https://localhost:7288',
                changeOrigin: true,
                secure: false,
            },
        },
    },
})