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
  QRS = new require( './../lib/qrs' );

var qrs = new QRS();

describe( 'qrs', function () {
  it( 'should be properly set up', function ( done ) {
    assert( typeof(qrs) === 'object' );
    assert( typeof(qrs.set) === 'function' );
    done();
  } );

  it( 'should receive startup params', function ( done ) {

    var qrs2 = new QRS( {host: 'testhost'} );
    qrs2.config.should.have.property( 'host', 'testhost' );
    done();
  } );

  it( 'should allow to change params', function ( done ) {
    var qrs2 = new QRS( {host: 'testhost'} );
    qrs2.set( 'host', 'testhost2' );
    qrs2.config.should.have.property( 'host', 'testhost2' );
    done();
  } );

} );
