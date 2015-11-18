/*global describe,it,beforeEach,before,after,afterEach*/
/* jshint -W030 */
'use strict';

var chai = require( 'chai' );
var expect = chai.expect;
var QRS = new require( './../lib/qrs' );
var leche = require( 'leche' );
var withData = leche.withData;
var extend = require( 'extend-shallow' );
var fsUtils = require( 'fs-utils' );
var path = require( 'path' );
var setup = require( './testSetup' );

var testConfig = fsUtils.readYAMLSync( path.join( __dirname, './test-config.yml' ) );
var globalConfig = {
	host: testConfig.host,
	useSSL: testConfig.useSSL,
	xrfkey: testConfig.xrfkey,
	fiddler: testConfig.fiddler
};
var qrs;

describe( 'qrs.extension', function () {
	withData( setup.testLoop, function ( sessionInfo ) {

		var testConfig = extend( globalConfig, sessionInfo );

		beforeEach( function ( done ) {
			qrs = new QRS( testConfig );
			done();
		} );

		it( 'should be an object', function () {
			expect( qrs.extension ).to.exist;
		} );

		it( 'should return all installed extensions', function ( done ) {
			qrs.extension.getInstalled()
				.then( function ( data ) {
					expect( data ).to.exist;
					expect( data ).to.be.an.array;
				}, function ( err ) {
					expect( err ).to.not.exist;
				} )
				.done( function (  ) {
					done();
				});
		} );

		// Todo: To make the test repeatable & reliebable we have to upload first, then we can check the test.
		it( 'should allow a filter to only return specific types', function ( done ) {
			qrs.extension.getInstalled( ['visualization-template'])
				.then( function ( data ) {
					expect( data ).to.exist;
					expect( data ).to.be.an.array;
				}, function ( err ) {
					expect( err ).to.not.exist;
				} )
				.done( function (  ) {
					done();
				});
		} );

		//Todo: Improve the test
		it( 'should return only extensions of type <visualization>', function ( done ) {
			qrs.extension.getInstalledVis( )
				.then( function ( data ) {
					expect( data ).to.exist;
					expect( data ).to.be.an.array;
				}, function ( err ) {
					expect( err ).to.not.exist;
				} )
				.done( function (  ) {
					done();
				});
		} );

		//Todo: Improve the test
		it( 'should return only extensions of type <visualization-template>', function ( done ) {
			qrs.extension.getInstalledVisTemplates( )
				.then( function ( data ) {
					expect( data ).to.exist;
					expect( data ).to.be.an.array;
				}, function ( err ) {
					expect( err ).to.not.exist;
				} )
				.done( function (  ) {
					done();
				});
		} );

		//Todo: Improve the test
		it( 'should return only extensions of type <mashup>', function ( done ) {
			qrs.extension.getInstalledMashups( )
				.then( function ( data ) {
					expect( data ).to.exist;
					expect( data ).to.be.an.array;
				}, function ( err ) {
					expect( err ).to.not.exist;
				} )
				.done( function (  ) {
					done();
				});
		} );

		//Todo: Improve the test
		it( 'should return only extensions of type <mashup-template>', function ( done ) {
			qrs.extension.getInstalledMashupTemplates( )
				.then( function ( data ) {
					expect( data ).to.exist;
					expect( data ).to.be.an.array;
				}, function ( err ) {
					expect( err ).to.not.exist;
				} )
				.done( function (  ) {
					done();
				});
		} );

		it.skip( 'doesn\'t allow upload of extension with a different type than .zip', function ( done ) {
			expect( true ).to.equal( false );
			done();
		} );

		it.skip( 'doesn\'t allow upload of non existing files', function ( done ) {
			expect( true ).to.equal( false );
			done();
		} );

		describe( 'should allow deletion of an extension', function () {

			before( '', function( done) {
				qrs.extension.upload
				done();
			});
			after( '', function(done) {


				done();
			});

			it('...', function( done) {
				expect( true ).to.equal( true );
				done();
			});
		} );


	} );

} );
