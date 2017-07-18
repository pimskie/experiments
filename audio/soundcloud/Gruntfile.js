/*jshint boss: true, curly: true, eqeqeq: true, eqnull: true, expr: true,
	immed: true, noarg: true, onevar: true, quotmark: single, strict: true,
	trailing: true, undef: true, node: true */

// https://github.com/zonak/grunt-ftp-deploy

module.exports = function (grunt) {

	'use strict';

	// Load all NPM installed grunt tasks
	require('load-grunt-tasks')(grunt);

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		banner: '/*! <%= pkg.title || pkg.name %> - Copyright (c) <%= grunt.template.today("yyyy-mm-dd") %> <%= pkg.author %> */\n',

		paths: {
			source: './src',
			dist: './dist',
			img: {
				source: '<%= paths.source %>/img',
				dist: '<%= paths.dist %>/img'
			},
			js: {
				source: '<%= paths.source %>/js',
				dist: '<%= paths.dist %>/js'
			},
			css: {
				source: '<%= paths.source %>/scss',
				dist: '<%= paths.dist %>/css'
			}
		}
	});

	grunt.config('browserify', {
		options: {
			browserifyOptions: {
				debug: true // Source maps (inline)
			},
			transform: [
				['babelify', {
					presets: ['es2015']
				}]
			]
		},
		dev: {
			options: {
				watch: false
			},
			files: [
				{ '<%= paths.js.dist %>/main.js': ['<%= paths.js.source %>/main.js'] }
				// {
				// 	expand: true,
				// 	cwd: '<%= paths.js.source %>',
				// 	src: ['workers/**/*.js'],
				// 	dest: '<%= paths.js.dist %>'
				// }
			]
		},
		dist: {
			options: {
				browserifyOptions: {
					debug: false
				}
			},
			files: '<%= browserify.dev.files %>'
		}
	});

	grunt.config('copy', {
		options: {
			expand: true
		},
		dist: {
			files: [{
				expand: true,
				cwd: '<%= paths.js.source %>',
				src: 'workers/**',
				dest: '<%= paths.js.dist %>'
			}]
		}
	});

	grunt.config('uglify', {
		options: {
			banner: '<%= banner %>',
			preserveComments: false,
			quoteStyle: 1,
			report: 'min',
			compress: {
				drop_console: true
			}
		},
		dist: {
			files: [{
				expand: true,
				cwd: '<%= paths.js.dist %>',
				src: ['**/*.js', '!*.min.js'],
				dest: '<%= paths.js.dist %>'
			}]
		}
	});

	grunt.config('sass', {
		options: {
			sourceMap: true
		},
		dist: {
			files: {
				'<%= paths.css.dist %>/skin1.css': '<%= paths.css.source %>/skin1.scss',
				'<%= paths.css.dist %>/skin2.css': '<%= paths.css.source %>/skin2.scss',
				'<%= paths.css.dist %>/skin3.css': '<%= paths.css.source %>/skin3.scss',
				'<%= paths.css.dist %>/skin4.css': '<%= paths.css.source %>/skin4.scss'
			}
		}
	});

	grunt.config('postcss', {
		options: {
			map: true, // Use earlier generated source map
			processors: [
				require('postcss-import')(),
				require('cssnano')({
					autoprefixer: {
						add: true,
						browsers: ['last 2 versions']
					},
					discardComments: {
						removeAll: true
					},
					safe: true
				})
			]
		},
		dist: {
			src: '<%= paths.css.dist %>/*.css'
		}
	});

	grunt.config('notify', {
		dev: {
			options: {
				message: ' ' // Empty space to only show errors
			}
		}
	});

	grunt.config('browserSync', {
		options: {
			proxy: 'localhost/experiments/audio/soundcloud/',
			// proxy: 'lab.local/experiments/audio/soundcloud/',
			notify: {
				styles: {
					top: 'auto',
					bottom: '0',
					borderRadius: '0'
				}
			}
		},
		dev: {
			options: {
				watchTask: true
			},
			bsFiles: {
				src: [
					'<%= paths.css.dist %>/**/*.css',
					'<%= paths.js.dist %>/**/*.js'
				]
			}
		}
	});

	grunt.config('watch', {
		js: {
			files: ['<%= paths.js.source %>/**/*.js'],
			tasks: ['browserify:dev'],
			options: {
				spawn: false
			}
		},

		css: {
			files: ['<%= paths.css.source %>/**/*.scss'],
			tasks: ['sass', 'postcss'],
			options: {
				spawn: false
			}
		}
	});

	// Dev task
	grunt.registerTask('dev', ['browserify:dev', 'sass', 'postcss']);

	// Build task
	grunt.registerTask('build', ['browserify:dist', 'uglify', 'sass', 'postcss']);

	// Default task
	grunt.registerTask('default', ['dev', 'browserSync:dev', 'watch']);

};
