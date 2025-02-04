import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true, // Pour faciliter le débogage
    outDir: 'build', // Spécifie le dossier de sortie de la build
  },
});