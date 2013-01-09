'use strict';

var endsWith = require('es5-ext/lib/String/prototype/ends-with')
  , objects  = require('../objects')

  , parse = JSON.parse
  , functionRe = new RegExp('^\\s*function[\\0-\'\\)-\\uffff]*' +
		'\\(([\\0-\\(\\*-\\uffff]*)\\)\\s*\\{([\\0-\\uffff]*)\\}\\s*$');

module.exports = function (value) {
	var type, flags, data;
	if (!value) return undefined;
	type = value[0];
	value = value.slice(1);
	switch (type) {
	case '0':
		return null;
	case '1':
		return Boolean(Number(value));
	case '2':
		return Number(value);
	case '3':
		return parse('"' + value + '"');
	case '4':
		return new Date(Number(value));
	case '5':
		value = parse('"' + value + '"');
		flags = value.slice(value.lastIndexOf('/') + 1);
		return RegExp(value.slice(1, -(1 + flags.length)), flags);
	case '6':
		data = parse('"' + value + '"').match(functionRe).slice(1);
		if (data[1][0] === '\n') data[1] = data[1].slice(1);
		if (endsWith.call(data[1], '\n')) data[1] = data[1].slice(0, -1);
		return Function.apply(null, data);
	case '7':
		return objects._get(value);
	default:
		throw new TypeError('Incorrect value');
	}
};
