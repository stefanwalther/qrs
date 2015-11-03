'use strict';
var gulp = require( 'gulp' );
var senseGo = require( 'sense-go' );
var path = require( 'path' );
var gulpVerb = require('gulp-verb');
var template = require('template')();

template.helper('apidocs', require('template-helper-apidocs'));

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
		gulp.src( './.verb.md')
			.pipe( gulpVerb( {dest: './README.md'}))
			.pipe( gulp.dest( './'));
	});

} );
