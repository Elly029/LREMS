import path from 'path';
import { defineConfig, loadEnv } from 'vite';
// Trigger restart
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 5173,
      host: '0.0.0.0',
    },
    preview: {
      allowedHosts: ['lrems.up.railway.app'],
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      chunkSizeWarningLimit: 700,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react'],
            'react-dom': ['react-dom'],
            'react-datepicker': ['react-datepicker'],
            jspdf: ['jspdf', 'jspdf-autotable'],
            xlsx: ['xlsx'],
          }
        }
      }
    }
  };
});
