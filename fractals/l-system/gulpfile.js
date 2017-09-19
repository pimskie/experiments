'use strict';

const gulp = require('gulp');

const watch = require('gulp-watch');
const util = require('gulp-util');

const uglify = require('gulp-uglify');
const babel = require('gulp-babel');

const sass = require('gulp-sass');
const sassGlob = require('gulp-sass-glob');
const sourcemaps = require('gulp-sourcemaps');
const postcss = require("gulp-postcss")
const atImport = require("postcss-import")
const autoprefixer = require('autoprefixer');
const cssnano = require('gulp-cssnano');

const browserSync = require('browser-sync').create();

const config = {
	isProduction: util.env._.includes('build') || util.env.production,
};

const paths = {
	src: './source',
	dist: './dist',
};

gulp.task('scss', () => gulp
	.src(`${paths.src}/scss/**/*.scss`)
	.pipe(config.isProduction ? util.noop() : sourcemaps.init())
	.pipe(sassGlob())
	.pipe(sass())
	.pipe(postcss([
		atImport(),
		autoprefixer({
			browsers: ['last 2 versions'],
		}),
	]))
	.pipe(config.isProduction ? cssnano() : sourcemaps.write())
	.pipe(config.isProduction ? util.noop() : sourcemaps.write())
	.pipe(gulp.dest(`${paths.dist}/css`))
);

gulp.task('serve', () => {
	browserSync.init({
		server: './',
		port: 1337,
		open: false,
	});
});

gulp.task('watch', () => {
	watch(`${paths.src}/scss/**/*.scss`, () => {
		gulp.start('scss');
	});

	watch(['./*.html', './dist/**'], () => {
		browserSync.reload();
	});
});

gulp.task('default', ['scss', 'serve', 'watch']);
gulp.task('build', ['copy', 'scss']);
