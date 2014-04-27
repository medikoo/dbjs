'use strict';

var primitiveSet = require('es5-ext/object/primitive-set')
  , resolve      = require('esniff/accessed-properties')('this')
  , memoize      = require('memoizee/plain')

  , re = new RegExp('^\\s*function\\s*(?:[\\0-\'\\)-\\uffff]+)*\\s*\\(\\s*' +
	'(_observe[\\/*\\s]*)?\\)\\s*\\{([\\0-\\uffff]*)\\}\\s*$')
  , ignored = primitiveSet('constructor', 'clear', 'database', 'delete',
		'entries', 'forEach', 'has', 'key', 'keys', 'master', 'object', 'set',
		'size', 'values')
  , isFn = RegExp.prototype.test.bind(/^\s*\(/);

module.exports = memoize(function (fn) {
	var body = String(fn).match(re)[2], shift = 0;
	resolve(body).forEach(function (data) {
		var name = data.name, start;
		if (name[0] === '_') return;
		if (ignored[name]) return;
		if (isFn(body.slice(data.end + shift))) return;
		start = data.start - 5 + shift;
		body = body.slice(0, start) + '_observe(this._get(\'' + name + '\'))' +
			body.slice(data.end + shift);
		shift += 18;
	});
	if (!shift) return fn;
	return new Function('_observe', body);
});
