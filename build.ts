import * as esbuild from 'esbuild';
import * as path from "path";
import * as url from "url";
import {minify} from "uglify-js";
import * as child_process from "child_process";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ESM_REQUIRE_SHIM = `
await (async () => {
  const { dirname } = await import("path");
  const { fileURLToPath } = await import("url");

  /**
   * Shim entry-point related paths.
   */
  if (typeof globalThis.__filename === "undefined") {
    globalThis.__filename = fileURLToPath(import.meta.url);
  }
  if (typeof globalThis.__dirname === "undefined") {
    globalThis.__dirname = dirname(globalThis.__filename);
  }
  /**
   * Shim require if needed.
   */
  if (typeof globalThis.require === "undefined") {
    const { default: module } = await import("module");
    globalThis.require = module.createRequire(import.meta.url);
  }
})();
`;
await esbuild.build({
    entryPoints: ['src/index.ts'],
    bundle: true,
    treeShaking: true,
    minify: true,
    tsconfig: path.join(__dirname, 'tsconfig.json'),
    platform: 'node',
    target: 'node20',
    outfile: path.join(__dirname, 'dist', 'index.js'),
    format: 'esm',
    banner: {
        js: minify(ESM_REQUIRE_SHIM).code
    },
    define: {
        __COMMIT_HASH__: JSON.stringify(child_process.execSync('git rev-parse HEAD').toString().trim())
    },
    external: ['blocked-at']
});
