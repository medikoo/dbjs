'use strict';

var startsWith = require('es5-ext/string/#/starts-with')
  , isDbjsKind = require('./is-dbjs-kind');

module.exports = function (value/*, owner*/) {
	var owner = arguments[1];
	if (!isDbjsKind(value)) return false;
	if (!value.owner || !value.owner.__id__) return false;
	if (!startsWith.call(value.__id__, value.owner.__id__ + '/')) return false;
	if (owner == null) return true;
	return value.owner === owner;
};
