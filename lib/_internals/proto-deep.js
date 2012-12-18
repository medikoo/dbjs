'use strict';

var remove     = require('es5-ext/lib/Array/prototype/remove')
  , startsWith = require('es5-ext/lib/String/prototype/starts-with')

  , getOwnPropertyNames = Object.getOwnPropertyNames
  , objProto = Object.prototype;

module.exports = function self(proto, name) {
	var prop, nuProto;
	if (!startsWith.call(name, '__') || (name === '__value') ||
			!(prop = this[name]) || (this[name] !== this[name.slice(1)])) {
		return;
	}
	nuProto = proto[name] || objProto;
	if (prop.__proto__._children_) remove.call(prop.__proto__._children_, prop);
	prop.__proto__ = nuProto;
	if (nuProto._children_) nuProto._children_.push(prop);
	getOwnPropertyNames(prop).forEach(self.bind(prop, proto[name] || objProto));
	prop._refresh_();
};
