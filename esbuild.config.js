const esbuild = require("esbuild");
const path = require("path");
const { polyfillNode } = require("esbuild-plugin-polyfill-node");

esbuild
  .build({
    entryPoints: ["./src/index.js"],
    bundle: true,
    outfile: "./dist/bundle.js",
    platform: "browser",
    format: "iife",
    globalName: "highlayer",
    minify: true,
    sourcemap: true,
    define: {
      "process.env.NODE_ENV": '"production"',
      global: "window",
    },
    plugins: [
      polyfillNode({
        polyfills: {
          crypto: true,
        },
      }),
    ],
  })
  .catch(() => process.exit(1));
