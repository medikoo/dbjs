'use strict';

var setPrototypeOf = require('es5-ext/object/set-prototype-of');

module.exports = exports = function (obj, proto, name) {
	if (!obj.hasOwnProperty('__descendants__')) return proto;
	obj.__descendants__._plainForEach_(function (obj) {
		if (obj.hasOwnProperty(name)) {
			setPrototypeOf(obj[name], proto);
			return;
		}
		exports(obj, proto, name);
	});
	return proto;
};
