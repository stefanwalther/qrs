
```js
var QRS = require('{%= name %}');
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
qrs.get('about', function( data ) {
	
	// do something with the result
	
});
```
