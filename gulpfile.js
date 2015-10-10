'use strict';
var gulp = require( 'gulp' );
var senseGo = require( 'sense-go' );
var path = require( 'path' );

var userConfig = senseGo.loadYml( path.join( __dirname, 'sense-go.yml' ) );
senseGo.init( gulp, userConfig, function () {
	gulp.task( 'all', gulp.series(
		'bump:patch',
		'git:add',
		'git:commit',
		'git:push',
		'npm:publish'
	) );
} );
