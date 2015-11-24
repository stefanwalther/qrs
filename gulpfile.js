'use strict';
var gulp = require( 'gulp' );
var senseGo = require( 'sense-go' );
var path = require( 'path' );
var gulpVerb = require( 'gulp-verb' );
var template = require( 'template' )();
var mocha = require( 'gulp-mocha' );
var istanbul = require( 'gulp-istanbul' );

template.helper( 'apidocs', require( 'template-helper-apidocs' ) );

var userConfig = senseGo.loadYml( path.join( __dirname, 'sense-go.yml' ) );
senseGo.init( gulp, userConfig, function () {
	gulp.task( 'all', gulp.series(
		'bump:patch',
		'git:add',
		'git:commit',
		'git:push',
		'npm:publish'
	) );

	gulp.task( 'verb', function () {
		gulp.src( './.verb.md' )
			.pipe( gulpVerb( {dest: './README.md'} ) )
			.pipe( gulp.dest( './' ) );
	} );

	gulp.task('pre-test', function () {
		return gulp.src(['./lib/**/*.js'])
				// Covering files
				.pipe(istanbul())
				// Force `require` to return covered files
				.pipe(istanbul.hookRequire());
	});
	gulp.task( 'test', function () {
		return gulp.src( ['./test/unit/*.spec.js'])
			.pipe( mocha( {reporter: 'spec'} ) )
			.pipe( istanbul.writeReports() );
			//.pipe( istanbul.enforceThresholds( {thresholds: {global: 90}} ) );
	} );
	gulp.task('test:unit', gulp.series('pre-test', 'test'));
} );
