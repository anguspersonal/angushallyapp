import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    root: 'frontend', // Set the root to the frontend directory
    plugins: [react()],
    server: {
        port: 5173, // Specify the port for the development server
        open: true, // Automatically open the browser
    },
    build: {
        outDir: 'dist', // Output directory for the production build
    }
});