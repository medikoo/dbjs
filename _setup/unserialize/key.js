'use strict';

var endsWith = require('es5-ext/string/#/ends-with')

  , parse = JSON.parse
  , functionRe = new RegExp('^\\s*function[\\0-\'\\)-\\uffff]*' +
		'\\(([\\0-\\(\\*-\\uffff]*)\\)\\s*\\{([\\0-\\uffff]*)\\}\\s*$')
  , isDigit = RegExp.prototype.test.bind(/\d/);

module.exports = function (value, objects) {
	var type, flags, data, obj, input = value;
	if (!value) throw new TypeError('Incorrect value');
	type = value[0];
	if (!isDigit(type)) return value;
	value = value.slice(1);
	if (type === '1') return Boolean(Number(value));
	if (type === '2') {
		if (value[0] === '"') value = parse(value);
		value = Number(value);
		if (isNaN(value)) throw new TypeError("Cannot unserialize: " + input);
		return value;
	}
	if (type === '3') return parse(value);
	if (type === '4') {
		value = Number(value);
		if (isNaN(value)) throw new TypeError("Cannot unserialize: " + input);
		return new Date(value);
	}
	if (type === '5') {
		value = parse(value);
		flags = value.slice(value.lastIndexOf('/') + 1);
		return RegExp(value.slice(1, -(1 + flags.length)), flags);
	}
	if (type === '6') {
		data = parse(value).match(functionRe).slice(1);
		if (data[1][0] === '\n') data[1] = data[1].slice(1);
		if (endsWith.call(data[1], '\n')) data[1] = data[1].slice(0, -1);
		return Function.apply(null, data);
	}
	if (type === '7') {
		obj = objects.unserialize(value);
		if (obj._kind_ !== 'descriptor') return obj;
		return obj.object._getObject_(obj._sKey_);
	}
	throw new TypeError('Incorrect value');
};
