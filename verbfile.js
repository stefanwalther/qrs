'use strict';
var verb = require('verb');
verb.helper('apidocs', require('template-helper-apidocs'));

verb.task('default', function() {
	verb.src('.verb.md')
		.pipe(verb.dest('.'));
});
