'use strict';

var d          = require('es5-ext/lib/Object/descriptor')
  , callable   = require('es5-ext/lib/Object/valid-callable')
  , startsWith = require('es5-ext/lib/String/prototype/starts-with')
  , ee         = require('event-emitter')

  , call = Function.prototype.call
  , getOwnPropertyNames = Object.getOwnPropertyNames;

module.exports = Object.defineProperties(ee(), {
	_forEachRelation_: d(function (cb/*, thisArg*/) {
		var thisArg = arguments[1];
		callable(cb);
		getOwnPropertyNames(this).forEach(function (name) {
			var rel;
			if (!startsWith.call(name, '__')) return;
			rel = this[name];
			if (!rel) return;
			if (rel._type_ !== 'relation') return;
			call.call(cb, thisArg, rel, rel._id_, this);
		}, this);
	})
});

require('./instance');
require('./property');
require('./properties');
require('../history');
require('../signal');
