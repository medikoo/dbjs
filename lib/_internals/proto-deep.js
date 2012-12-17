'use strict';

var startsWith = require('es5-ext/lib/String/prototype/starts-with')

  , getOwnPropertyNames = Object.getOwnPropertyNames;

module.exports = function self(proto, name) {
	var prop;
	if (!startsWith.call(name, '__') || (name === '__value') ||
			!(prop = this[name])) {
		return;
	}
	this[name].__proto__ = proto[name];
	getOwnPropertyNames(this[name]).forEach(self.bind(this[name],
		proto[name] || {}));
};
