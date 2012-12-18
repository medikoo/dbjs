'use strict';

var startsWith = require('es5-ext/lib/String/prototype/starts-with')

  , getOwnPropertyNames = Object.getOwnPropertyNames;

module.exports = function self(proto, name) {
	var prop;
	if (!startsWith.call(name, '__') || (name === '__value') ||
			!(prop = this[name])) {
		return;
	}
	prop.__proto__ = proto[name];
	getOwnPropertyNames(prop).forEach(self.bind(prop, proto[name] || {}));
};
