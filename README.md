[![NPM version](https://img.shields.io/npm/v/qrs.svg?style=flat)](https://www.npmjs.com/package/qrs) [![Build Status](https://img.shields.io/travis/stefanwalther/qrs.svg?style=flat)](https://travis-ci.org/stefanwalther/qrs) [![dependencies](https://david-dm.org/stefanwalther/qrs.svg)](https://david-dm.org/stefanwalther/qrs)
# qrs
> Node.js library to communicate with Qlik Sense Repository Service (QRS) API.

NOTE: This solution is not actively maintained anymore. Contributors to take over are highly welcome.
Alternatively use [qrs-interact](https://github.com/eapowertools/qrs-interact)

![](https://raw.githubusercontent.com/stefanwalther/qrs/master/docs/images/qrs.png)

## Installation
Install with [npm](https://www.npmjs.com/):

```sh
$ npm install --save qrs
```

---
## Table of Contents
- [Usage](#usage)
- [Configuration Options](#configuration-options)
- [Server Setup](#server-setup)
- [API](#api)
- [Plugins](#plugins)
- [Running tests](#running-tests)
- [Contributing](#contributing)
- [Author](#author)
- [License](#license) 

---

## Usage
```js
var QRS = require('qrs');
var config = {
	"host": 'qsSingle',
	"useSSL": false,	
	"xrfkey": 'ABCDEFG123456789',
	"authentication": "header",
	"headerKey": 'hdr-usr',
	"headerValue": 'qsSingle\\swr'		
};
var qrs = new QRS( config );

// Now run your command like
qrs.get('qrs/about', function( data ) {
	
	// do something with the result
	
});
```

## Configuration Options
The configuration passed to the constructor of *qrs* drives how authentication is handled.

### Typical configurations

**Example using header authentication**

```javascript
var config = {
	authentication: 'header',
	host: 'server.mydomain.com',
	useSSL: true,
	virtualProxy: 'hdr',
	headerKey: 'hdr-usr',
	headerValue: 'mydomain\\justme'
}; 
```

**Example using certificates**

```js
var config = {
	authentication: 'certificates',
	host: 'server.mydomain.com',
	useSSL: true,
	cert: 'C:\\CertStore\\client.pem',
	key: 'C:\\CertStore\\client_key.pem',
	ca: 'C:\\CertStore\\root.pem',
	port: 4242,
	headerKey: 'X-Qlik-User',
	headerValue: 'UserDirectory=Internal;UserId=sa_repository'
};
```

### All options

* **`authentication`** - Authentication method, can be "`windows`", "`certificates`" or "`header`", defaults to "`windows`".
* **`host`** - Qualified / fully qualified name or IP-address of the server where the Qlik Sense Repository server is running on, defaults to "`127.0.0.1`"
* **`useSSL`** - Whether to use SSL or not, defaults to `false`. 
* **`headerKey`** - Header key.
* **`headerValue`** - Header value.
* **`virtualProxy`** - Name of the virtual proxy.
* **`port`** - Port to be used.
* **`cert`** - Path to client certificate file (client.pem).
* **`key`** - Path to client key file (client_key.pem).
* **`ca`** - Path to ca file (root.pem)

## Server Setup
There are several options to ensure that communication between this node.js module and Qlik Sense server is working properly:

**Authenticating with HTTP headers**
* [Using Header Authentication in Qlik Sense: Setup and Configuration](https://github.com/stefanwalther/articles/tree/master/header-authentication-configuration)
* [Authenticating with HTTP headers](http://help.qlik.com/sense/2.1/en-us/developer/Subsystems/RepositoryServiceAPI/Content/RepositoryServiceAPI/RepositoryServiceAPI-Connect-API-Authenticate-Reqs-Http-Headers.htm) in Qlik Sense Help for Developers 2.1.1

**Authenticating with a server certificate**
* [Authenticating with Certificates: Setup and Configuration](https://github.com/stefanwalther/articles/tree/master/authentication-certificates)
* [Authenticating with the server certificate](http://help.qlik.com/sense/2.1/en-us/developer/Subsystems/RepositoryServiceAPI/Content/RepositoryServiceAPI/RepositoryServiceAPI-Connect-API-Authenticate-Reqs-Certificate.htm) in Qlik Sense Help for Developer 2.1.1

## API

### [qrs](lib/qrs.js#L37)
Work with Qlik Sense's REST based Repository API (qrs) from within node.js.

**Configuration options:**

**Params**

* `qrsConfig` **{Object}**: Global configuration options    

**Example**

```js
var QRS = require('qrs');
var config =  {

var qrs = new QRS( config );

```

### [.request](lib/qrs.js#L82)
(Internal) generic method to send requests to QRS. Typically this method is only used internally, use `get`, `post`, `put` or `delete`.

**Params**

* `method` **{String}**: Http method, can be `GET`, `POST`, `PUT` or `DELETE` (defaults to `GET`).    
* `endpoint` **{String}**: Endpoint to be used. Check the online documentation of the Qlik Sense Repository API to get a list of all endpoints available.    
* `urlParams` **{Array<string,object>}**: Additional URL parameters, defined as key/value array, for example  `[{"key": "foo", "value": valueObj}]`.    
* `jsonBody` **{Object}**: JSON object to be used as the body for the Http request.    
* `body` **{String}**: Body, if not defined as Json object, body needs to be passed as a buffer to e.g. upload a file.    
* `additionalRequestOptions` **{Object}**: Additional request options.    
* `additionalHeaders` **{Object}**: Additional headers.    
* `returns` **{promise}**: Returns a promise.  

**Example**

```js
var QRS = require('qrs');

var qrsConfig = ...; // Set configuration options
var qrs = new QRS( qrsConfig );

qrs.request( 'GET', 'qrs/about', null, null)
   .then( function( data ) {
			console.log( 'about', data );
		}, function ( err ) {
			console.error( 'An error occurred: ', err);
		});
```

### [.get](lib/qrs.js#L173)
Same as `request()` but with `method: 'GET'`.

**Params**

* `endpoint` **{String}**: QRS endpoint to be used.    
* `urlParams` **{Array<string,object>}**: Additional URL parameters, defined as key/value array, for example  `[{"key": "foo", "value": valueObj}]`.    
* `returns` **{promise}**: Returns a promise.  

**Example**

```js
qrs.get( 'qrs/about')
       .then( function ( data) {
			console.log('about: ', data );
		}, function ( err ) {
			console.error( err );
		});
```

### [.post](lib/qrs.js#L186)

Same as `request()` but with `method: 'POST'`.

**Params**

* `endpoint` **{String}**: QRS endpoint to be used.    
* `urlParams` **{Array<string,object>}**: Additional URL parameters, defined as key/value array, for example  `[{"key": "foo", "value": valueObj}]`.    
* `jsonBody` **{Object}**: Body to be posted, defined as JSON object.    
* `returns` **{promise}**: Returns a promise.  

### [.postFile](lib/qrs.js#L199)

Post a file, actually same as `post()`, instead of posting a JSON body, posts a file buffer.

**Params**

* `endpoint` **{String}**: QRS endpoint to be used.    
* `urlParams` **{Array<string,object>}**: Additional URL parameters, defined as key/value array, for example  `[{"key": "foo", "value": valueObj}]`    
* **{String}**: filePath Absolute or relative file path.    
* `returns` **{promise}**: Returns a promise.  

### [.put](lib/qrs.js#L215)

Same as `request()` but with `method: 'PUT'`.

### [.delete](lib/qrs.js#L225)

Same as `request()` but with `method: 'DELETE'`.

### [.getUrl](lib/qrs.js#L240)

Return the Url for the REST call considering the given configuration options

**Params**

* `endpoint` **{string}**: Endpoint for the qrs call.    
* `urlParams` **{Object[]}**: Additional URL parameters as key/value array.    
* `urlParam.key` **{String}**: Key.    
* `urlParam.value` **{Object}**: Value.    
* `returns` **{String}**: The constructed Url.  

### [.setConfig](lib/qrs.js#L297)
Set global configurations options for qrs. Can be used to change the configuration options after `qrs` has been initialized.

**Params**

* `qrsConfig` **{Object}**: Global configuration options    

**Example**

```js
var QRS = require('qrs');
var configCert = {
	authentication: 'certificates',
	...
};
var qrs = new QRS( configCert );

// Talking to the server using certificates
qrs.get('qrs/about', function( result ) {
	// ...
});

// Change configuration options, e.g.
var configHeader = {
	authentication: 'header',
	...
};

qrs.setConfig( configHeader);

// Talking to the server, now using header authentication.
qrs.get('qrs/about', function( result ) {
 // ...
});
```

### [.getConfig](lib/qrs.js#L320)
Return the current configuration options.

* `returns` **{qrsConfig}** `qrsConfig`: Configuration object.  

**Example**

```js
var QRS = require('qrs');
var config = {
	host: 'myserver.domain.com';
};
var qrs = new QRS( config );
var host = qrs.getConfig( 'host' );
console.log(host); //<== 'myserver.domain.com'
```

### [.set](lib/qrs.js#L348)
Change a single configuration property.

**Params**

* `key` **{String}**: Key of the property    
* `val` **{Object}**: Value    

**Example**

```js
var QRS = require('qrs');
var config = {
	host: 'myserver.domain.com';
};
var qrs = new QRS( config );

qrs.get('qrs/about', function( result ) {
	// about from myserver.domain.com
});

qrs.set('host', 'mysecondserver.domain.com');
qrs.get('qrs/about', function( result ) {
 // about from mysecondserver.domain.com
});
```

### [.getConfigValue](lib/qrs.js#L359)

Retrieve a single configuration property.

**Params**

* `key` **{String}**: Key of the property    
* `returns` **{Object}**: Value of the requested property, otherwise undefined.  

### [.plugins](lib/qrs.js#L373)

Returns an array of loaded plugins. Use `registerPlugin()` to load a plugin.

### [.registerPlugin](lib/qrs.js#L423)
Register a plugin to work with the base class of `qrs`. Have a look at some of the already existing plugins like `./lib/sugar/ep-mime.js`

**Params**

* **{Object}**: plugin    

**Example**

```js

// -----------------------------------------------------------
// Define the plugin.
// ~~
// Purpose: Do something great with extensions.
// Filename: ep-extension.js
// -----------------------------------------------------------

function Extension ( base ) {

	function doSomething() {
		base.get( 'qrs/extension/schema')
			.then( function( result ) {
				// result now holding the result from the server
			}, function (err) {
				// error handling
			});

		return {
			doSomething: doSomething
		};
}

module.exports = Extension;

// -----------------------------------------------------------
// Register and use it
// -----------------------------------------------------------

var qrs = new QRS( config );
qrs.registerPlugin('./ep-extension.js');

// Use the plugin
qrs.extension.upload( myFile, function( result ) {
		// The file has been uploaded
});

```

## Plugins
Think of plugins as some kind of sugar layer with additional business logic on top of `qrs`.
It is easy to either add new plugins to the `qrs` repository or just to load some external code/plugin.
The list of built-in plugins is probably and hopefully a growing one (and hopefully not only created by the author of this document).

The following plugins are available with the current version of `qrs`:

<!--### Plugin "Extension"-->
<!--{%= apidocs("lib/sugar/ep-extension.js") %}-->
<!------->

### Plugin "Mime"

Mime type definition

### [Mime](lib/sugar/ep-mime.js#L24)

Handle Mime types in QRS.

**Params**

* **{qrs}**: base - Base class, instance of `qrs`.    

### [add](lib/sugar/ep-mime.js#L91)
Adds a mime type.

When adding the mime type, the following validation logic will be performed:
- All existing mime types will be grouped by mime, additionalHeaders and binary.
- If there is already a mime type with the same information compared to the given one, the field extension will be updated.
An example is listed below.

**Params**

* **{Object}**: mimeTypeDef    
* **{string}**: mimeTypeDef.mime - Mime type, e.g. "application/markdown".    
* **{string}**: mimeTypeDef.extensions - Comma delimited string of supported file extensions, e.g. "md,markdown".    
* **{boolean}**: mimeTypeDef.additionalHeaders - Additional headers, defaults to null.    
* **{boolean}**: mimeTypeDef.binary - Whether this is a binary file type or not.    
* `returns` **{promise}**  

**Example**

```js
// -----------------------------------------------------------------
// Inserting logic
// -----------------------------------------------------------------	 *

// Assuming that the following mime type is already stored:
{
	extensions: "md"
	mime: "application/markdown",
	additionalHeaders: null,
	binary: false
}
// If you add the following mime type
{
	extensions: "markdown"
	mime: "application/markdown",
	additionalHeaders: null,
	binary: false
}
//this would then result into:
{
	extensions: "md,markdown"
	mime: "application/markdown",
	additionalHeaders: null,
	binary: false
}

// -----------------------------------------------------------------
// Adding a mime type:
// -----------------------------------------------------------------

var mimeType = {
	extensions: "md"
	mime: "application/markdown",
	additionalHeaders: null,
	binary: false
}

qrs.mime.add( mimeType )
		.then( function (result ) {
			// work with the result
		}, function (err) {
			// error handling
});

```

### [get](lib/sugar/ep-mime.js#L144)
Returns a list of existing mime types.

The list can be filtered by the file-extensions as shown in the example.

**Params**

* **{string}**: filter    
* `returns` **{promise}**  

**Example**

```js
getMimeTypes( 'html')
   .then( function (data) {

		// data now contains an array of mime types where the field extensions contains "html"
		// Results: html, xhtml, etc.

	})
```

### [addMultiple](lib/sugar/ep-mime.js#L161)

Adds an array of mime types
(See `add` for more information about `mimeTypeDef`).

**Params**

* **{mimeTypeDef[]}**: mimeTypeDefs - Array of mime type definitions.    
* `returns` **{promise}**  

### [addFromFile](lib/sugar/ep-mime.js#L206)
Add mime types defined in a file. Every line in the file is defined by the following entries, delimited by a semi-colon (;): - extensions - {string} file extension, multiple values separated by a comma, e.g. "md,markdown" - mime - {string} Mime type - additionalHeaders - {boolean} Additional defined headers, leave blank if unsure - binary - {boolean} Whether this is a binary format or not.

**Params**

* **{String}**: filePath - Absolute file path.    
* `returns` **{promise}**  

**Example**

```bash
md;application/markdown;;false
yml;text/yml;;false
woff2;application/font-woff2;;true
```

### [deleteById](lib/sugar/ep-mime.js#L240)

Delete a mime entry from the Qlik Sense Repository by its given Id.

**Params**

* **{String}**: id    
* `returns` **{promise}**  

### [getUpdateOrInsert](lib/sugar/ep-mime.js#L308)

Returns whether the mime type already exists or not.

**Params**

* **{mimeTypeDef}**: mimeTypeDef    
* `returns` **{object}**: result - Returned result.  
* `returns` **{boolean}**: result.isUpdate - Whether to update or add.  

---

## Running tests
Running and reviewing unit tests is a great way to get familiarized with a library and its API. You can install dependencies and run tests with the following command:

```sh
$ npm install && npm test
```

## Contributing
Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](../../issues/new).

## Author
**Stefan Walther**
* [qliksite.io](http://qliksite.io)
* [twitter/waltherstefan](http://twitter.com/waltherstefan)
* [github.com/stefanwalther](http://github.com/stefanwalther)

## License
Copyright © 2018, Stefan Walther.
MIT

***
_This file was generated by [verb-generate-readme](https://github.com/verbose/verb-generate-readme), v0.6.0, on January 21, 2018._

