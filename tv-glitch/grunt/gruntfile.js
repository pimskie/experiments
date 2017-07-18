module.exports = (grunt) => {
	require('load-grunt-tasks')(grunt);

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json')
	});

	grunt.config('sass', {
		options: {
			sourceMapEmbed: false
		},
		dist: {
			files: [{
				expand: true,
				cwd: '../scss',
				src: ['*.scss'],
				dest: '../',
				ext: '.css'
			}]
		}
	});

	grunt.config('watch', {
		sass: {
			files: ['**/*.scss'],
			tasks: ['sass'],
			options: {
				spawn: false,
				cwd: '../scss'
			}
		}
	});

	grunt.registerTask('default', ['sass', 'watch']);
};
