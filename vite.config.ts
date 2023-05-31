import { defineConfig } from 'vite';
import react from "@vitejs/plugin-react-swc";
import { viteSingleFile } from "vite-plugin-singlefile";
import { ViteMinifyPlugin } from 'vite-plugin-minify';
import tsconfigPaths from 'vite-tsconfig-paths';
import inject from "@rollup/plugin-inject";

export default defineConfig({
    root: 'web/',
    build: {
        rollupOptions: {
            input: {
                app: 'web/index.html'
            },
            plugins: [inject({ Buffer: ['buffer', 'Buffer'] })]
        },
        outDir: '../dist/',
        emptyOutDir: false,
        minify: true,
        cssMinify: true
    },
    plugins: [tsconfigPaths({
        projects: ['tsconfig.web.json']
    }), react(), viteSingleFile(), ViteMinifyPlugin()]
});
