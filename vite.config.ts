import {defineConfig} from 'vite';
import {viteSingleFile} from "vite-plugin-singlefile";
import {ViteMinifyPlugin} from 'vite-plugin-minify';
import tsconfigPaths from 'vite-tsconfig-paths';
import {NodeGlobalsPolyfillPlugin} from "@esbuild-plugins/node-globals-polyfill";
import * as child_process from "child_process";
import ConditionalCompile from "vite-plugin-conditional-compiler";
import preact from "@preact/preset-vite";

export default defineConfig({
    root: 'web/',
    build: {
        rollupOptions: {
            input: {
                app: 'web/index.html'
            },
            onwarn: (warning, warn) => {
                if (warning.code === 'MODULE_LEVEL_DIRECTIVE' && warning.message.includes(`'use client'`))
                    return;
                warn(warning);
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
            '@assets': '/assets',
            'react': 'preact/compat',
            'react-dom': 'preact/compat',
            'react-dom/test-utils': 'preact/test-utils',
            'react/jsx-runtime': 'preact/jsx-runtime'
        },
    },
    define: {
        __COMMIT_HASH__: JSON.stringify(child_process.execSync('git rev-parse HEAD').toString().trim())
    },
    envDir: '../',
    plugins: [tsconfigPaths({
        projects: ['../tsconfig.web.json']
    }), preact(), viteSingleFile(), ViteMinifyPlugin(), ConditionalCompile()]
});
