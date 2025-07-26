import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

// Custom plugin to detect Symbol usage in development
const symbolDetectionPlugin = {
    name: 'symbol-detection',
    transform(code, id) {
        if (process.env.NODE_ENV === 'development' && (id.endsWith('.tsx') || id.endsWith('.ts'))) {
            // Check for potential Symbol issues
            if (code.includes('asChild') && code.includes('Button')) {
                console.warn(`⚠️  Potential Symbol issue in ${id}: Button with asChild detected`);
            }
        }
        return null;
    }
};

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.tsx',
            refresh: true,
        }),
        react(),
        process.env.NODE_ENV === 'development' ? symbolDetectionPlugin : null,
    ].filter(Boolean),
    build: {
        sourcemap: process.env.NODE_ENV === 'development',
        rollupOptions: {
            onwarn(warning, warn) {
                // Suppress certain warnings
                if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
                    return
                }
                warn(warning)
            }
        }
    },
    server: {
        host: 'localhost',
        port: 5173,
        strictPort: true,
        hmr: {
            overlay: true
        }
    },
    optimizeDeps: {
        include: [
            '@inertiajs/react',
            'react',
            'react-dom',
            '@radix-ui/react-dialog',
            '@radix-ui/react-toast',
            '@radix-ui/react-slot'
        ]
    }
});
