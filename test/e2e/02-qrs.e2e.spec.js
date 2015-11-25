/*global describe, it, beforeEach*/
/*jshint -W030,-W117*/

'use strict';
var chai = require( 'chai' );
var expect = chai.expect;
var assert = chai.assert;
var QRS = new require( './../../lib/qrs' );
var extend = require( 'extend-shallow' );
var testSetup = require( './../testSetup' );
var chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

var qrs;
var globalConfig = testSetup.globalConfig;

describe( 'qrs', function () {

	var testConfig = null;
	testSetup.testLoop.forEach( function ( testLoopConfig ) {

		describe( 'with ' + testLoopConfig.name, function () {

			/**
			 * Reset the configuration before each test.
			 */
			beforeEach( function ( done ) {

				testConfig = extend( globalConfig, testLoopConfig.config );
				qrs = new QRS( testConfig );
				done();

			} );

			it.only( 'should return something for /about', function (  ) {

				return expect( qrs.get('/qrs/about') ).to.eventually.have.property('schemaPath', 'About');

			} );

		} );
	} );
} );
