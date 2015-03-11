/*!
 * qrs <https://github.com/stefanwalther/qrs>
 *
 * Copyright (c) 2015 .
 * Licensed under the MIT license.
 */

'use strict';

var assert = require('assert');
var should = require('should');
var qrs = require('./');

describe('qrs', function () {
  it('should:', function () {
    qrs('a').should.equal({a: 'b'});
    qrs('a').should.eql('a');
  });

  it('should throw an error:', function () {
    (function () {
      qrs();
    }).should.throw('qrs expects valid arguments');
  });
});
