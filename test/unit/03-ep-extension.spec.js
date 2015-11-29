/*global describe,beforeEach,it*/
/*jshint -W030,-W117*/

'use strict';

var chai = require( 'chai' );
var chaiAsPromised = require( 'chai-as-promised' );
var expect = chai.expect;
var QRS = new require( './../../lib/qrs' );
var nock = require( 'nock' );
var testSetup = require( './../testSetup' );
var extend = require('extend-shallow');

chai.use( chaiAsPromised );

describe( 'Unit: ep-extension', function () {

	var qrs = null;
	beforeEach( function () {
		var config = extend( testSetup.globalConfig, {
			'authentication': 'header'
		});
		qrs = new QRS( config );
	} );

	it.skip( 'should return only extensions of type <visualization>', function ( done ) {
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

} );