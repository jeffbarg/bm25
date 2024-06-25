import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

import pkg from "./package.json" assert { type: "json" };

export default [
  // ESM build
  {
    input: "src/index.ts",
    output: {
      file: pkg.module,
      format: "es",
    },
    plugins: [typescript(), resolve(), commonjs()],
  },
  // UMD build
  {
    input: "src/index.ts",
    output: {
      file: pkg.main,
      format: "umd",
      name: "Bm25Search", // Replace with your library's global name
    },
    plugins: [typescript(), resolve(), commonjs()],
  },
];
