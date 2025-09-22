import path from "node:path";
import url from "node:url";
import fs from "node:fs";
import { defineConfig } from "@rspack/cli";
import { rspack } from "@rspack/core";
import { HtmlPlugin } from "./html-plugin.mjs";

const dirname = path.dirname(url.fileURLToPath(import.meta.url));
const root = path.dirname(path.dirname(dirname));

if (fs.existsSync(path.join(root, "dist"))) {
  fs.rmSync(path.join(root, "dist"), { recursive: true, force: true });
}

export default defineConfig({
  experiments: {
    css: true,
    outputModule: true,
  },
  entry: {
    index: "./src/gui/index.tsx",
    worker: "./src/worker/main.ts",
  },
  output: {
    filename: "[name].[contenthash].js",
    path: path.join(root, "dist"),
    module: true,
    chunkFormat: "module",
    chunkLoading: "import",
    workerChunkLoading: "import",
  },
  resolve: {
    extensions: ["...", ".ts", ".tsx", ".jsx"],
    extensionAlias: {
      ".js": [".ts", ".tsx", ".js"],
    },
    alias: {
      react: "preact/compat",
      "react-dom/test-utils": "preact/test-utils",
      "react-dom": "preact/compat",
      "react/jsx-runtime": "preact/jsx-runtime",
    },
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: {
          loader: "builtin:swc-loader",
          options: {
            jsc: {
              parser: {
                syntax: "ecmascript",
                jsx: true,
              },
            },
          },
        },
        type: "javascript/auto",
      },
      {
        test: /\.tsx?$/,
        use: {
          loader: "builtin:swc-loader",
          options: {
            jsc: {
              parser: {
                syntax: "typescript",
                tsx: true,
              },
              transform: {
                react: {
                  pragma: "h",
                  pragmaFrag: "Fragment",
                },
              },
            },
          },
        },
        type: "javascript/auto",
      },
      {
        test: /\.css$/i,
        use: [rspack.CssExtractRspackPlugin.loader, "css-loader"],
        type: "javascript/auto",
      },
    ],
  },
  plugins: [
    new HtmlPlugin({
      minify: false,
      filename: "index.html",
      template: "src/gui/index.html",
      inject: "head",
      baseHref: process.env.BASE_HREF,
    }),
    new rspack.CssExtractRspackPlugin({}),
    new rspack.CopyRspackPlugin({
      patterns: [{ from: "src/gui/icon.svg" }, { from: "src/gui/robots.txt" }],
    }),
    new rspack.javascript.EnableChunkLoadingPlugin("import"),
  ],
  devServer: {
    hot: false,
    port: 4200,
    historyApiFallback: true,
    allowedHosts: "all",
    host: "0.0.0.0",
    headers: [
      {
        key: "Cache-Control",
        value: "no-store",
      },
    ],
    devMiddleware: {
      // writeToDisk: true,
    },
  },
});
