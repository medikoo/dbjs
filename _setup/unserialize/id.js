'use strict';

var divisors = require('es5-ext/object/primitive-set')('/', '$', '*')

  , hasOwnProperty = Object.prototype.hasOwnProperty
  , $common, $string, char, str, result, last, collect, i;

collect = function () {
	result.push(str.slice(last, i - 1));
	last = i - 1;
};

$string = function () {
	if (char === '\\') ++i;
	if (char === '"') return $common;
	return $string;
};

$common = function () {
	if (char === '"') return $string;
	if (hasOwnProperty.call(divisors, char)) {
		collect();
		char = str[i++];
		collect();
		return $common();
	}
	return $common;
};

module.exports = function (id) {
	var state, rest;
	str = String(id);
	result = [];
	i = last = 0;
	state = $common;
	while ((char = str[i++])) (state = state());
	rest = str.slice(last, i - 1);
	if (rest) result.push(rest);
	return result;
};
