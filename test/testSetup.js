'use strict';
var fsUtils = require( 'fs-utils' ),
  path = require( 'path' );

var TestSetup = function () {
  var testConfig = fsUtils.readYAMLSync( path.join( __dirname, './test-config.yml' ) );

  function getTestLoop () {

    var r = {};

    if ( testConfig.authentication.header.enabled ) {
      r['Header authentication'] = [{
        authentication: 'header',
        headerKey: testConfig.authentication.header.headerKey,
        headerValue: testConfig.authentication.header.headerValue,
        virtualProxy: testConfig.authentication.header.virtualProxy
      }]
    }
    if ( testConfig.authentication.ntlm.enabled ) {
      r['Ntlm authentication'] = [{
        authentication: 'ntlm',
        virtualProxy: testConfig.authentication.ntlm.virtualProxy
      }]
    }

    console.log( 'testLoop', r );
    return r;

  }

  return {
    testLoop: getTestLoop()
  }

};

module.exports = new TestSetup;
