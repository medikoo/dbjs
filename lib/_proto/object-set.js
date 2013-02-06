'use strict';

var callable    = require('es5-ext/lib/Object/valid-callable')
  , d           = require('es5-ext/lib/Object/descriptor')
  , ee          = require('event-emitter/lib/core')
  , ReadOnlySet = require('../utils/read-only-set')

  , call = Function.prototype.call
  , defineProperties = Object.defineProperties, keys = Object.keys
  , getValue = function (name) { return this[name]; }
  , ObjectSet;

module.exports = ObjectSet = function (obj) {
	defineProperties(this, {
		obj: d(obj),
		count: d('w', 0)
	});
};

ObjectSet.prototype = ee(Object.create(ReadOnlySet.prototype, {
	constructor: d(ObjectSet),
	values: d.gs(function () { return keys(this).map(getValue, this); }),
	forEach: d(function (cb/*, thisArg*/) {
		var thisArg = arguments[1];
		callable(cb);
		keys(this).forEach(function (name) {
			call.call(cb, thisArg, this[name], null, this);
		}, this);
	})
}));

require('./object-filter-set');
require('./object-ordered-list');
