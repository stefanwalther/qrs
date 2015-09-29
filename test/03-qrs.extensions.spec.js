/*!
 * qrs <https://github.com/stefanwalther/qrs>
 *
 * Copyright (c) 2015 .
 * Licensed under the MIT license.
 */

'use strict';

var chai = require( 'chai' );
var  assert = chai.assert;
var  should = chai.should();
var  QRS = new require( './../lib/qrs' );
var  leche = require( 'leche' );
var  withData = leche.withData;
var  extend = require( 'extend-shallow' );
var  fsUtils = require( 'fs-utils' );
var  path = require( 'path' );
var  logger = require( './../lib/logger.js' );

var testConfig = fsUtils.readYAMLSync( path.join( __dirname, './test-config.yml' ) );
var globalConfig = {
	host: testConfig.host,
	useSSL: testConfig.useSSL,
	xrfkey: testConfig.xrfkey,
	fiddler: testConfig.fiddler
};
var qrs;

describe.skip( 'extensions basics', function () {
  it( 'works fine', function ( done ) {
    assert( true );
    done();
  } );

} );
