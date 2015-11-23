/*global describe,it,beforeEach,before*/
/*jshint -W030,-W117*/
'use strict';

var chai = require( 'chai' );
var expect = chai.expect;
var QRS = new require( './../../lib/qrs' );
var testSetup = require( './../testSetup' );

var qrs;
var globalConfig = testSetup.globalConfig;

describe( 'sugar-plugin: ep-mime', function () {

	beforeEach( function ( done ) {
		qrs = new QRS( globalConfig );
		done();
	} );

	it( 'should be an object', function () {
		expect( qrs.mime ).to.exist;
	} );

	it( 'should contain methods', function ( done ) {
		expect( qrs.mime.get ).to.exist;
		done();
	} );
} );
