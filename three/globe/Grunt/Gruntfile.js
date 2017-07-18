module.exports = function (grunt) {

	'use strict';

	// Project configuration.
	grunt.initConfig({
		paths: {
			frontend: '../'
		},
		pkg: grunt.file.readJSON('package.json'),
		banner: '/*! <%= pkg.title || pkg.name %> - Copyright (c) <%= grunt.template.today("yyyy-mm-dd") %> <%= pkg.author %> */\n',
		jshint: {
			grunt: {
				src: [
					'gruntfile.js'
				],
				options: {
					jshintrc: '.jshintrc'
				}
			},
			frontend: {
				src: [
					'<%= paths.frontend %>/js/source/*.js'
				],
				options: {
					jshintrc: '<%= paths.frontend %>/js/.jshintrc'
				}
			},
		},
		
		uglify: {
			options: {
				preserveComments: false,
				report: 'min'
			},
			frontend: {
				files: {
					'<%= paths.frontend %>/js/build/main.js': '<%= paths.frontend %>/js/source/main.js' // Overwrite file
				}
			}
		},
		sass: {
			frontend: {
				options: {
					style: 'expanded',
					lineNumbers: true,
					quiet: false,
					cache: false
				},
				files: [{
					expand: true,
					cwd: '<%= paths.frontend %>/css/sass',
					src: ['*.scss'],
					dest: '<%= paths.frontend %>/css',
					ext: '.css'
				}]
			},
		},
		cssmin: {
			options: {
				banner: '<%= banner %>',
				keepSpecialComments: 0
			},
			frontend: {
				expand: true,
				cwd: '<%= paths.frontend %>/css',
				src: ['*.css', '!*.min.css'],
				dest: '<%= paths.frontend %>/css'
				//ext: '.min.css' // Add a .min.css extension
			},
		},
		notify: {
			sass: {
				options: {
					message: 'ok' // Required, empty space to only show errors
				}
			},
			js: {
				options: {
					message: ' ' // Required, empty space to only show errors
				}
			}
		},
		watch: {
			grunt: {
				files: ['<%= jshint.grunt.src %>'],
				tasks: ['jshint:grunt']
			},
			'js-frontend': {
				files: ['<%= jshint.frontend.src %>'],
				tasks: ['scripts:frontend', 'notify:js']
			},

			'sass-frontend': {
				files: ['<%= paths.frontend %>/css/sass/**/*.scss'],
				tasks: ['sass:frontend', 'notify:sass']
			},
			livereload: {
				// Here we watch the files the sass task will compile to
				// These files are sent to the live reload server after sass compiles to them
				// https://github.com/gruntjs/grunt-contrib-watch#live-reloading
				options: {
					livereload: true
				},
				files: [
					'<%= paths.frontend %>/js/build/*.js',
					'<%= paths.frontend %>/css/*.css',
					'<%= paths.backoffice %>/css/*.css'
				]
			}
		}
	});

	// Load NPM installed plugin tasks from the package.json
	require('load-grunt-tasks')(grunt);

	// Default task
	grunt.registerTask('default', ['sass']);

	// Scripts task
	grunt.registerTask('scripts:frontend', ['jshint:frontend', 'uglify:frontend']);

};