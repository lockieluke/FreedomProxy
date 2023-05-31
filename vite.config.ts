import { defineConfig } from 'vite';
import react from "@vitejs/plugin-react-swc";
import { viteSingleFile } from "vite-plugin-singlefile";
import { ViteMinifyPlugin } from 'vite-plugin-minify';
import tsconfigPaths from 'vite-tsconfig-paths';
import {NodeGlobalsPolyfillPlugin} from "@esbuild-plugins/node-globals-polyfill";

export default defineConfig({
    root: 'web/',
    build: {
        rollupOptions: {
            input: {
                app: 'web/index.html'
            }
        },
        outDir: '../dist/',
        emptyOutDir: false,
        minify: true,
        cssMinify: true
    },
    optimizeDeps: {
        esbuildOptions: {
            define: {
                global: "globalThis",
            },
            plugins: [
                NodeGlobalsPolyfillPlugin({
                    process: true,
                    buffer: true,
                })
            ],
            treeShaking: true,
            minify: true
        }
    },
    resolve: {
        alias: {
            process: "process/browser",
            stream: "stream-browserify",
            zlib: "browserify-zlib",
            util: "util",
            '@assets': '/assets'
        },
    },
    plugins: [tsconfigPaths({
        projects: ['tsconfig.web.json']
    }), react(), viteSingleFile(), ViteMinifyPlugin()]
});
