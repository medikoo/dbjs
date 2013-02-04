'use strict';

var callable    = require('es5-ext/lib/Object/valid-callable')
  , d           = require('es5-ext/lib/Object/descriptor')
  , ee          = require('event-emitter/lib/core')
  , ReadOnlySet = require('../utils/read-only-set')

  , call = Function.prototype.call
  , defineProperties = Object.defineProperties, keys = Object.keys
  , normalize = function (name) { return name.slice(1); }
  , NamesSet;

module.exports = NamesSet = function (obj) {
	defineProperties(this, {
		obj: d(obj),
		count: d('w', 0)
	});
};

NamesSet.prototype = ee(Object.create(ReadOnlySet.prototype, {
	constructor: d(NamesSet),
	values: d.gs(function () {
		return keys(this).map(normalize);
	}),
	forEach: d(function (cb/*, thisArg*/) {
		var thisArg = arguments[1];
		callable(cb);
		keys(this).forEach(function (name) {
			call.call(cb, thisArg, normalize(name), null, this);
		}, this);
	})
}));
