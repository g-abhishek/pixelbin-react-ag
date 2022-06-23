import { nodeResolve } from '@rollup/plugin-node-resolve';
import { babel } from '@rollup/plugin-babel';

const packageJson = require("./package.json");

export default {
    external: ["@pixelbin/core", "async-retry", "axios", "react", "pixelbin-core-final"],
    input: "src",
    output: [{
        file: packageJson.main,
        // file: "dist/cjs/bundle.js",
        format: "cjs",
    },{
        file: packageJson.module,
        // file: "dist/esm/bundle.js",
        format: "esm",
    }],
    
    plugins: [nodeResolve(), babel({ babelHelpers: "bundled"})]
}