import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/pathfinding-visualizer/',
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
  },
});