'use strict';

var endsWith = require('es5-ext/string/#/ends-with')

  , parse = JSON.parse
  , functionRe = new RegExp('^\\s*function[\\0-\'\\)-\\uffff]*' +
		'\\(([\\0-\\(\\*-\\uffff]*)\\)\\s*\\{([\\0-\\uffff]*)\\}\\s*$');

module.exports = function (value, objects) {
	var type, flags, data, obj;
	if (!value) return undefined;
	type = value[0];
	value = value.slice(1);
	if (type === '0') return null;
	if (type === '1') return Boolean(Number(value));
	if (type === '2') return Number(value);
	if (type === '3') return parse('"' + value + '"');
	if (type === '4') return new Date(Number(value));
	if (type === '5') {
		value = parse('"' + value + '"');
		flags = value.slice(value.lastIndexOf('/') + 1);
		return RegExp(value.slice(1, -(1 + flags.length)), flags);
	}
	if (type === '6') {
		data = parse('"' + value + '"').match(functionRe).slice(1);
		if (data[1][0] === '\n') data[1] = data[1].slice(1);
		if (endsWith.call(data[1], '\n')) data[1] = data[1].slice(0, -1);
		return Function.apply(null, data);
	}
	if (type === '7') {
		obj = objects.unserialize(value);
		if ((obj._kind_ === 'descriptor') && (obj.__id__ !== value)) {
			return obj.object._getObject_(obj._sKey_);
		}
		return obj;
	}
	throw new TypeError('Incorrect value');
};
