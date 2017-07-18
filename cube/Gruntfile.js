module.exports = function (grunt) {

	'use strict';

	var root = './',
		paths = {
			root: root,
			img: root + '/img',
			css: root + '/css',
			scss: root + '/scss',
			js: {
				vendor: root + '/js/vendor',
				source: root + '/js/source',
				compiled: root + '/js/compiled',
				dist: root + '/js/build'
			}
		};

	// Load all NPM installed grunt tasks
	require('load-grunt-tasks')(grunt);

	grunt.initConfig({
		paths: paths,
		pkg: grunt.file.readJSON('package.json'),
		banner: '/*! <%= pkg.title || pkg.name %> - Copyright (c) <%= grunt.template.today("yyyy-mm-dd") %> <%= pkg.author %> */\n',

		sass: {
			dev: {
				options: {
					sourceMap: true
				},
				files: [{
					expand: true,
					cwd: '<%= paths.scss %>',
					src: ['*.scss'],
					dest: '<%= paths.css %>',
					ext: '.css'
				}]
			},
			dist: {
				files: '<%= sass.dev.files %>'
			}
		},

		postcss: {
			options: {
				map: false, // inline sourcemaps
				processors: [
					require('autoprefixer')({browsers: 'last 2 versions'}) // add vendor prefixes
					//require('cssnano')() // minify the result
				]
			},
			dev: {
				src: '<%= paths.css %>/*.css'
			}
		},

		notify: {
			dev: {
				options: {
					message: ' ' // Empty space to only show notifactions when an error occurs
				}
			}
		},

		watch: {
			grunt: {
				files: [ 'Gruntfile.js'],
				options: {
					reload: true
				}
			},
			sass: {
				files: ['<%= paths.scss %>/**/*.scss'],
				tasks: ['sass:dev', 'postcss:dev', 'notify:dev'],
				options: {
					spawn: false,
					livereload: true
				}
			}
		}
	});

	// Dev task
	grunt.registerTask('dev', ['sass:dev']);

	// Build task
	grunt.registerTask('build', ['eslint:before', 'browserify:dev', 'uglify:dist']);

	// Default task
	grunt.registerTask('default', ['dev', 'watch']);

};
