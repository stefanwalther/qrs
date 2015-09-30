'use strict';

var chai = require( 'chai' );
var expect = chai.expect;
var assert = chai.assert;
var QRS = new require( './../lib/qrs' );
var leche = require( 'leche' );
var withData = leche.withData;
var extend = require( 'extend-shallow' );
var fsUtils = require( 'fs-utils' );
var path = require( 'path' );
var logger = require( './../lib/logger.js' );
var setup = require( './testSetup' );
var _ = require( 'lodash' );
var Q = require( 'q' );

var testConfig = fsUtils.readYAMLSync( path.join( __dirname, './test-config.yml' ) );

var globalConfig = {
	host: testConfig.host,
	useSSL: testConfig.useSSL,
	xrfkey: testConfig.xrfkey,
	fiddler: testConfig.fiddler
};
var qrs;

describe( 'qrs.mime', function () {

	withData( setup.testLoop, function ( sessionInfo ) {

		var idsToDelete = [];
		beforeEach( function ( done ) {
			var testConfig = extend( globalConfig, sessionInfo );
			qrs = new QRS( testConfig );
			done();
		} );

		afterEach( function ( done ) {

			if ( idsToDelete && idsToDelete.length > 0 ) {
				var promises = [];
				_.each( idsToDelete, function ( id ) {
					promises.push( qrs.mime.deleteById.bind(null,  id ) );
				} );
				Q.all( promises )
					.then( function ( data ) {
						idsToDelete.length = 0;
						done();
					} )
			} else {
				done();
			}
		} );

		it( 'mime should be an object', function () {
			expect( qrs.mime ).to.exist;
		} );

		it( 'mime should contain methods', function ( done ) {
			expect( qrs.mime.get ).to.exist;
			done();
		} );

		it( 'should return the existing mime types', function ( done ) {
			qrs.mime.get()
				.then( function ( data ) {
					expect( data ).to.exist;
					expect( data ).to.not.be.empy;
					expect( data ).to.be.an.array;
				} )
				.done( function () {
					done();
				} );
		} );

		it( 'should filter for mime types', function ( done ) {
			qrs.mime.get( "extensions so 'html'" )
				.then( function ( data ) {
					expect( data ).to.exist;
					expect( data ).to.not.be.empy;
					expect( data ).to.be.an.array;
					expect( data ).to.have.length.above( 1 );
				} )
				.done( function () {
					done();
				} );
		} );

		it( 'filter for unknown should return nothing', function ( done ) {
			qrs.mime.get( "extensions so 'abcdefg'" )
				.then( function ( data ) {
					expect( data ).to.exist;
					expect( data ).to.not.be.empy;
					expect( data ).to.be.an.array;
					expect( data ).to.have.length( 0 );
				} )
				.done( function () {
					done();
				} );
		} );

		it( 'can create an export', function ( done ) {
			qrs.mime.createExport( path.resolve( './test/mimetypes.txt' ) )
				.then( function ( path ) {
					expect( path ).to.exist;
				} )
				.done( function () {
					done();
				} );
		} );

		describe( 'returns either objects to be updated or added', function () {

			var existingTypes = [
				{
					"id": "05750907-1728-46a5-b763-14d348208bf3",
					"createdDate": "2015-09-02T22:09:14.104Z",
					"modifiedDate": "2015-09-02T22:09:14.104Z",
					"modifiedByUserName": "INTERNAL\bootstrap",
					"mime": "application/xhtml+xml",
					"extensions": "xhtml,xht",
					"additionalHeaders": null,
					"binary": false,
					"privileges": null,
					"schemaPath": "MimeType"
				},
				{
					"id": "49974f33-31c2-4732-b057-7acb8f5303a0",
					"createdDate": "2015-09-02T22:09:14.104Z",
					"modifiedDate": "2015-09-02T22:09:14.104Z",
					"modifiedByUserName": "INTERNAL\bootstrap",
					"mime": "text/html;charset=utf-8",
					"extensions": "html,htm",
					"additionalHeaders": "X-UA-Compatible:IE=edge",
					"binary": false,
					"privileges": null,
					"schemaPath": "MimeType"
				}
			];

			it( 'returns the object to be updated', function () {
				var r = qrs.mime.getUpdateOrInsert( {
					"extensions": "foo",
					"mime": "text/html;charset=utf-8",
					"binary": false
				}, existingTypes );
				expect( r.isUpdate ).to.equal( true );
				expect( r.def ).to.be.an.object;
				expect( r.def ).to.not.be.an.array;
				expect( r.def.extensions ).to.be.equal( 'html,htm,foo' );
				expect( r.def.mime ).to.be.equal( 'text/html;charset=utf-8' );
			} );

			it( 'adds a new entry', function ( done ) {

				qrs.mime.add( {
					"extensions": "foo",
					"mime": "text/foo",
					"additionalHeaders": null,
					"binary": false
				} )
					.then( function ( data ) {
						expect( data ).to.exist;
						expect( data ).to.have.property( 'id' );
						idsToDelete.push( data.id );
					} , function ( err ) {
						expect(err ).to.not.exist;
					})
					.done( function () {
						done();
					} )
			} );

			it( 'adds multiple entries', function ( done ) {
				qrs.mime.addMultiple( [{
					"extensions": "foo",
					"mime": "text/foo",
					"additionalHeaders": null,
					"binary": false
				}, {
					"extensions": "bar",
					"mime": "text/bar",
					"additionalHeaders": null,
					"binary": false
				}] )
					.then( function ( data ) {
						expect( data ).to.exist;
						expect( data ).to.be.an.array;
						data.forEach( function ( item ) {
							idsToDelete.push( item.id );
						} );
					} , function ( err ) {
						assert(true, err);
					})
					.done( function () {
						done();
					} )
			} );

			it( 'updates existing entries', function ( done ) {
				qrs.mime.addMultiple( [{
					"extensions": "foo",
					"mime": "text/foobar",
					"additionalHeaders": null,
					"binary": false
				}, {
					"extensions": "bar",
					"mime": "text/foobar",
					"additionalHeaders": null,
					"binary": false
				}] )
					.then( function ( data ) {
						expect( data ).to.exist;
						expect( data ).to.be.an.array;
						_.each(data,  function ( item ) {
							expect( item ).to.have.property( 'extensions' );
							expect( item ).to.have.property( 'mime' );
							expect( item ).to.have.property( 'additionalHeaders' );
							expect( item ).to.have.property( 'binary' );
							expect( item.mime ).to.be.equal( 'text/foobar' );
							expect( item.additionalHeaders ).to.be.null;
							expect( item.binary ).to.be.equal( false );
							idsToDelete.push( data.id );
						});
						//Todo: We have a cleanup error here, check this out
						//expect(data[0].extensions ).to.be.equal('foo');
						//expect(data[1].extensions ).to.be.equal('foo,bar');
					} , function ( err ) {
						expect(err ).to.not.exist;
					})
					.done( function () {
						done();
					} )
			} );

			it( 'adds multiple entries from file (update)', function ( done ) {

				var sourceFile = path.resolve( './test/fixtures/foobar.txt' );
				qrs.mime.addFromFile( sourceFile )
					.then( function ( data ) {
						expect( data ).to.exist;
						expect( data ).to.be.an.array;
						expect( data ).to.have.length(2);
						_.each( data, function ( item ) {
							expect( item ).to.have.property( 'extensions' );
							expect( item ).to.have.property( 'mime' );
							expect( item ).to.have.property( 'additionalHeaders' );
							expect( item ).to.have.property( 'binary' );
							expect( item.mime ).to.be.equal( 'text/foobar' );
							expect( item.additionalHeaders ).to.be.null;
							expect( item.binary ).to.be.equal( false );
							idsToDelete.push( data.id );
						});
						//expect(data[0].extensions ).to.be.equal('foo');
						//expect(data[1].extensions ).to.be.equal('foo,bar');
					} , function ( err ) {
						expect( err ).to.not.exist;
					})
					.done( function () {
						done();
					} )
			} );

			it( 'adds multiple entries from file (update + insert)', function ( done ) {

				var sourceFile = path.resolve( './test/fixtures/foobarbaz.txt' );
				qrs.mime.addFromFile( sourceFile )
					.then( function ( data ) {
						expect( data ).to.exist;
						expect( data ).to.be.an.array;
						expect( data ).to.have.length(3);
						_.each( data, function ( item ) {
							expect( item ).to.have.property( 'extensions' );
							expect( item ).to.have.property( 'mime' );
							expect( item ).to.have.property( 'additionalHeaders' );
							expect( item ).to.have.property( 'binary' );
							expect( item.additionalHeaders ).to.be.null;
							expect( item.binary ).to.be.equal( false );
							idsToDelete.push( data.id );
						});
						idsToDelete.push( data.id );
					} , function ( err ) {
						expect( err ).to.not.exist;
					})
					.done( function () {
						done();
					} )
			} );
		} );

	} );
} );
