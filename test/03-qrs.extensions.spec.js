/*!
 * qrs <https://github.com/stefanwalther/qrs>
 *
 * Copyright (c) 2015 .
 * Licensed under the MIT license.
 */

'use strict';

var chai = require( 'chai' ),
  assert = chai.assert,
  should = chai.should(),
  QRS = new require( './../lib/qrs' ),
  leche = require( 'leche' ),
  withData = leche.withData,
  extend = require( 'extend-shallow' ),
  fsUtils = require( 'fs-utils' ),
  path = require( 'path' ),
  logger = require( './../lib/logger.js' );
;

describe( 'extensions basics', function () {
  it( 'works fine', function ( done ) {
    assert( true );
    done();
  } );

} );
