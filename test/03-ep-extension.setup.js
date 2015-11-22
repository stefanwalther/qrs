'use strict';

var zipper = require( 'zip-local' );
var fs = require( 'fs' );
var path = require( 'path' );
var rimraf = require( 'rimraf' );
var async = require( 'async' );

var ExtensionSetup = function () {

	var init = function ( callback ) {

		var dirToScan = path.join( __dirname, './fixtures/extensions' );
		fs.readdir( dirToScan, function ( err, files ) {

			var extensionDirs = files.map( function ( file ) {
				return path.join( dirToScan, file );
			} ).filter( function ( file ) {
				return fs.statSync( file ).isDirectory();
			} );

			async.map( extensionDirs, function ( file, cb ) {
				var zipSource = path.normalize( file );
				var fi = path.parse( file );
				var zipDest = path.normalize( path.join( fi.dir, fi.base + '.zip' ));
				rimraf( zipDest, function ( err ) {
					zipper.sync.zip( zipSource ).compress().save( zipDest );
					cb( null, zipDest );
				} );
			}, function ( err, results ) {
				callback( err, results );
			} );
		} );

	};

	return {
		init: init
	}

};
module.exports = ExtensionSetup;