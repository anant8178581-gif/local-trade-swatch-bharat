import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const leafletSafeguardPlugin = () => ({
  name: 'leaflet-safeguard',
  transform(code: string, id: string) {
    if (id.includes('leaflet')) {
      let modified = code;
      // Guard getPosition
      modified = modified.replace(
        /return\s+el\._leaflet_pos\s*\|\|\s*new\s+Point\(0,\s*0\);/g,
        'return (el && el._leaflet_pos) || new Point(0, 0);'
      );
      // Guard setPosition
      modified = modified.replace(
        /function\s+setPosition\(el,\s*point\)\s*\{/g,
        'function setPosition(el, point) { if (!el) return;'
      );
      // Guard minified getPosition
      modified = modified.replace(
        /return\s+(\w+)\._leaflet_pos\s*\|\|\s*new\s+(\w+)\(0,\s*0\)/g,
        'return ($1 && $1._leaflet_pos) || new $2(0, 0)'
      );
      if (modified !== code) {
        return {
          code: modified,
          map: null
        };
      }
    }
    return null;
  }
});

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [leafletSafeguardPlugin(), react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
