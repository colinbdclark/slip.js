/*global module*/
/*jshint strict:false*/

module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),

        jshint: {
            all: ["src/slip.js", "tests/**.*.js"],
            options: {
                jshintrc: true
            }
        },

        uglify: {
            options: {
                banner: "<%= slipjs.banners.short %>"
            },
            dist: {
                files: {
                    "dist/slip.min.js": ["src/slip.js"]
                }
            }
        },

        clean: {
            all: {
                src: ["slip.min.js"]
            }
        },

        githooks: {
            all: {
                "pre-commit": "default",
            }
        },

        slipjs: {
            banners: {
                short: "/*! slip.js <%= pkg.version %>, Copyright <%= grunt.template.today('yyyy') %> Colin Clark | flockingjs.org */\n\n"
            }
        }
    });

    // Load relevant Grunt plugins.
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-githooks");

    grunt.registerTask("default", ["clean", "jshint", "uglify"]);
};
