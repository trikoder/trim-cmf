module.exports = function(grunt) {

    grunt.initConfig({

        eslint: {
            options: {
                configFile: '.eslintrc.js',
                fix: true
            },
            target: [
                './src/js/**/*.js',
                'Gruntfile.js',
            ]
        },

        watch: {
            javascript: {
                expand: true,
                files: ['./src/js/**/*.js', 'Gruntfile.js'],
                tasks: ['eslint'],
                options: {
                    spawn: false
                }
            },
            docs: {
                expand: true,
                files: ['./docs-md/**/*.md'],
                tasks: ['buildDocs'],
                options: {
                    spawn: false
                }
            }
        },

        googlefonts: {
            build: {
                options: {
                    fontPath: './src/font/webFonts',
                    cssFile: './src/scss/partials/_webFonts.scss',
                    httpPath: '../font/webFonts/',
                    formats: {eot: true, ttf: true, woff: true, woff2: false, svg: true},
                    fonts: [{
                        family: 'Archivo Narrow',
                        subsets: ['latin-ext'],
                        styles: [400, '400italic', 700, '700italic']
                    }, {
                        family: 'Roboto',
                        subsets: ['latin-ext'],
                        styles: [400, '400italic', 700, '700italic']
                    }]
                }
            }
        },

        bump: {
            options: {
                files: ['package.json', 'package-lock.json'],
                commitFiles: ['package.json', 'package-lock.json'],
                tagName: '%VERSION%',
                push: false
            }
        },

    });

    require('load-grunt-tasks')(grunt);

    grunt.registerTask('buildDocs', function() {

        var attire = require('attire');
        var done = this.async();

        attire.buildDocs({
            files: [
                {
                    path: './docs-md/about.md',
                    emphasizeLead: true,
                    author: {
                        caption: 'Trikoder',
                        url: 'https://github.com/trikoder',
                        // image: 'https://s.gravatar.com/avatar/f5ef615518b19dbd4ea273e77030d399?s=80',
                        email: 'info@trikoder.net',
                        github: 'https://github.com/trikoder',
                        twitter: 'https://twitter.com/trikoder'
                    }
                },
                './docs-md/getting-started.md',
                './docs-md/core-concepts-and-api.md',
                './docs-md/adding-resource.md',
                './docs-md/list-elements.md',
                './docs-md/form-elements.md',
                './docs-md/base-controllers.md'
            ],
            dest: './docs/',
            projectTitle: 'Trim CMF',
            githubUrl: 'https://github.com/trikoder/trim',
            inlineCss: false
        }).then(function() {
            done();
            grunt.log.ok(['Docs builded']);
        });

    });

    grunt.registerTask('default', [
        'watch'
    ]);

    grunt.registerTask('build', [
        // 'googlefonts',
        'eslint',
        'buildDocs'
    ]);

};
