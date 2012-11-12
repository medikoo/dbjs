'use strict';

var startsWith  = require('es5-ext/lib/String/prototype/starts-with')

  , getPrototypeOf = Object.getPrototypeOf
  , getOwnPropertyNames = Object.getOwnPropertyNames;

module.exports = function (obj, ignores) {
	var prop, proto = getPrototypeOf(obj), done = {}, iterate;
	iterate = function (name) {
		if (done[name]) return;
		done[name] = true;
		if (!startsWith.call(name, '_$') || obj.hasOwnProperty(name) ||
				(ignores && ignores[name.slice(2)])) {
			return;
		}
		prop = proto[name];
		if (!prop || !prop._$required) return;
		if (prop._$required._value && (prop._value == null)) {
			throw new TypeError('undefined is not a value');
		}
	};
	while (proto !== Object.prototype) {
		getOwnPropertyNames(proto).forEach(iterate);
		proto = getPrototypeOf(proto);
	}
};
