/*global describe,it,beforeEach,before,after*/
/* jshint -W030 */
'use strict';

var chai = require( 'chai' );
var chaiAsPromised = require( 'chai-as-promised' );
var expect = chai.expect;
var QRS = new require( './../../lib/qrs' );
var extend = require( 'extend-shallow' );
var fsUtils = require( 'fs-utils' );
var path = require( 'path' );
var testSetup = require( './../testSetup' );
var async = require( 'async' );
var extensionSetup = require( './../03-ep-extension.setup' )();

chai.use( chaiAsPromised );

var qrs;

var globalConfig = testSetup.globalConfig;
describe( 'qrs.extension', function () {

	it( 'should be an object', function () {
		qrs = new QRS( globalConfig );
		expect( qrs.extension ).to.exist;
	} );

	testSetup.testLoop.forEach( function ( loopConfig ) {

		describe( 'with ' + loopConfig.name, function () {

			var testConfig = extend( globalConfig, loopConfig.config );

			after( function ( done ) {
				console.log( 'after \n' );
				//extensionSetup.cleanExtZipFiles( function ( /*err, extensions*/ ) {
				//	done();
				//} );
				done();
			} );

			before( function ( done ) {
				console.log( 'before\n' );
				extensionSetup.init( done );
			} );

			beforeEach( function ( done ) {
				qrs = new QRS( testConfig );
				async.map( extensionSetup.extensions, function ( ext, cb ) {
					qrs.extension.delete( ext.name )
						.then( function ( /*data*/ ) {
							//cb( null );
						}, function ( err ) {
							cb( err );
						} );
				}, function ( err /*, results */ ) {
					if ( err ) {
						throw err;
					}
					done();
				} );
			} );

			it( 'should return all installed extensions', function () {

				expect( qrs.extension.getInstalled() ).to.be.fulfilled.and.to.be.an.array;

			} );

			it( 'should allow a filter to only return specific types', function () {

				expect( qrs.extension.getInstalled( ['visualization-template'] ) ).to.be.fulfilled.and.to.be.an.array;

			} );

			//Todo: Improve the test => move to unit tests
			it( 'should return only extensions of type <visualization>', function ( done ) {
				qrs.extension.getInstalledVis()
					.then( function ( data ) {
						expect( data ).to.exist;
						expect( data ).to.be.an.array;
					}, function ( err ) {
						expect( err ).to.not.exist;
					} )
					.done( function () {
						done();
					} );
			} );

			//Todo: Improve the test => move to unit tests
			it( 'should return only extensions of type <visualization-template>', function ( done ) {
				qrs.extension.getInstalledVisTemplates()
					.then( function ( data ) {
						expect( data ).to.exist;
						expect( data ).to.be.an.array;
					}, function ( err ) {
						expect( err ).to.not.exist;
					} )
					.done( function () {
						done();
					} );
			} );

			//Todo: Improve the test ==> move to unit tests
			it( 'should return only extensions of type <mashup>', function ( done ) {
				qrs.extension.getInstalledMashups()
					.then( function ( data ) {
						expect( data ).to.exist;
						expect( data ).to.be.an.array;
					}, function ( err ) {
						expect( err ).to.not.exist;
					} )
					.done( function () {
						done();
					} );
			} );

			//Todo: Improve the test ==> move to unit tests
			it( 'should return only extensions of type <mashup-template>', function ( done ) {
				qrs.extension.getInstalledMashupTemplates()
					.then( function ( data ) {
						expect( data ).to.exist;
						expect( data ).to.be.an.array;
					}, function ( err ) {
						expect( err ).to.not.exist;
					} )
					.done( function () {
						done();
					} );
			} );

			describe( 'qrs.extension.upload', function () {

				it( 'doesn\'t allow upload of non existing files', function () {

					var extPath = path.join( __dirname, './fixtures/extensions/qrs-ABCDEFGHIJKLMNOPQ.zip' );
					return expect( qrs.extension.upload( extPath ) ).to.eventually.be.rejectedWith( 'File does not exist: ' + extPath );

				} );

				it( 'doesn\'t allow upload of an extension with a different type than .zip', function () {

					var extPath = path.join( __dirname, './../fixtures/extensions/qrs-sample.7z' );
					return expect( qrs.extension.upload( extPath ) ).to.eventually.be.rejectedWith( 'Only .zip files can be uploaded.' );

				} );
			} );

			/**
			 * @todo: Returns "bad request" if extension is already existing.
			 */
			it.skip( 'should allow upload of an extension with absolute path', function ( done ) {
				var extPath = path.join( __dirname, './../fixtures/extensions/qrs-sample.zip' );
				qrs.extension.upload( extPath )
					.then( function ( data ) {
						expect( data ).to.exist;
					}, function ( err ) {
						expect( err ).to.not.exist;
					} )
					.done( function () {
						done();
					} );
			} );

			describe( 'should allow deletion of an extension', function () {

				before( '', function ( done ) {
					//qrs.extension.upload
					done();
				} );
				after( '', function ( done ) {

					done();
				} );

				it( '...', function ( done ) {
					expect( true ).to.equal( true );
					done();
				} );
			} );

			it.skip( 'should refuse to upload an extension if already existing, even with another type', function ( done ) {
				expect( true ).to.equal( false );
				done();
			} );

		} );
	} );
} );
