import esbuild from 'esbuild';
import * as path from "path";
import * as url from "url";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

await esbuild.build({
    entryPoints: ['runtime/index.ts'],
    bundle: true,
    treeShaking: true,
    minify: true,
    platform: 'browser',
    outfile: path.join(__dirname, 'dist', 'runtime.js'),
    format: 'cjs',
    define: {
        'process': "{}",
        'process.env': '{}'
    }
});

console.log('✅  FreedomRuntime Rebuilt');
