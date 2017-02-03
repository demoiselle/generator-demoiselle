'use strict';
const path = require('path');
const gulp = require('gulp');
// const debug = require('gulp-debug');
const eslint = require('gulp-eslint');
const excludeGitignore = require('gulp-exclude-gitignore');
const mocha = require('gulp-mocha');
const istanbul = require('gulp-istanbul');
const nsp = require('gulp-nsp');
const plumber = require('gulp-plumber');
const coveralls = require('gulp-coveralls');
const runSequence = require('run-sequence');

gulp.task('static', () => {
  return gulp.src(
    [
      // '**/*.js'
      'generators/**/*.js',
      'Utils/*.js',
      'test/**/*.js',
      '!node_modules/**',
      '!generators/**/templates/**/*'
    ])
    // .pipe(debug({ title: 'static file:', minimal: true }))
    .pipe(excludeGitignore())
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('nsp', (cb) => {
  if(process.env.TRAVIS_CI){
    cb();
  } else {
    nsp({
      package: path.resolve('package.json')
    }, cb);
  }
});

gulp.task('pre-test', () => {
  return gulp.src([
    'generators/app/index.js',
    'generators/add/index.js',
    'generators/swagger/index.js',
    'generators/fromEntity/index.js'
  ])
    // .pipe(debug({ title: 'test file:', minimal: true }))
    .pipe(excludeGitignore())
    .pipe(istanbul({
      includeUntested: true
    }))
    .pipe(istanbul.hookRequire());
});

gulp.task('test', ['pre-test'], (cb) => {
  gulp.src(['test/*.js'])
    .pipe(plumber())
    .pipe(mocha({ reporter: 'spec' }))
    .pipe(istanbul.writeReports())
    .on('end', () => {
      cb();
    });
});

gulp.task('coveralls', ['test'], () => {
  if (!process.env.CI) {
    return;
  }

  return gulp.src(path.join(__dirname, 'coverage/lcov.info'))
    .pipe(coveralls());
});

gulp.task('watch', () => {
  gulp.watch(['generators/**/*.js', '!generators/**/templates/**/*', 'test/**'], ['test']);
});

gulp.task('prepublish', []);
gulp.task('default', () => {
  runSequence('static', 'test');
});
