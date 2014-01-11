'use strict';

var resolve = require('esniff/accessed-properties')('this')
  , memoize = require('memoizee/lib/primitive')

  , re = new RegExp('^\\s*function\\s*(?:[\\0-\'\\)-\\uffff]+)*\\s*\\(\\s*' +
	'(_observe[\\/*\\s]*)?\\)\\s*\\{([\\0-\\uffff]*)\\}\\s*$');

module.exports = memoize(function (fn) {
	return resolve(String(fn).match(re)[2]);
});
