
import uglify from 'rollup-plugin-uglify';
import buble from 'rollup-plugin-buble';
import pkg from './package.json';

const shortBanner = "/*! slip.js " + pkg.version +
                    " Copyright 2017 Colin Clark | " +
                    pkg.homepage + " */\n\n";

export default [
    // UMD, minified build
    {
        input: pkg.module,
        banner: shortBanner,
        output: {
            file: pkg.browser,
            format: 'umd',
        },
        name: 'slip',
        plugins: [
            uglify({
                output: { comments: /^!/ }
            }),
            buble(),
        ]
    },

    // UMD, un-minified build
    {
        input: pkg.module,
        output: {
            file: pkg.main,
            format: 'umd'
        },
        name: 'slip',
        plugins: [
            buble()
        ]
    }
];
