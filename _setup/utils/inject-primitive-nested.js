'use strict';

var setPrototypeOf = require('es5-ext/object/set-prototype-of')

  , hasOwnProperty = Object.prototype.hasOwnProperty;

module.exports = function self(obj, proto, name, key) {
	if (!obj.hasOwnProperty('__descendants__')) return proto;
	obj.__descendants__._plainForEach_(function (obj) {
		var target;
		if (obj.hasOwnProperty(name)) {
			if (hasOwnProperty.call(obj[name], key)) {
				target = obj[name][key];
				setPrototypeOf(target, proto);
				return;
			}
		}
		self(obj, proto, name, key);
	});
	return proto;
};
