'use strict';

var DbjsError = require('../error')

  , reject, $common, $string, str, i, char;

reject = function (original) {
	throw new DbjsError(original + ' is not valid event string',
		'INVALID_EVENT_STRING');
};

$common = function () {
	if (char === '.') return;
	if (char === '"') return $string;
	return $common;
};

$string = function () {
	if (char === '\\') {
		char = str[++i];
		return $string;
	}
	if (char === '"') return $common;
	return $string;
};

module.exports = function (data) {
	var stamp, index, original = data, state;
	data = String(data);

	// Stamp
	index = data.indexOf('.');
	if (index === -1) reject(original);
	stamp = Number(data.slice(0, index));
	if (isNaN(stamp)) reject(original);
	data = data.slice(index + 1);
	if (data.length < 2) reject(original);

	// Id
	str = data;
	i = -1;
	state = $common;
	while ((char = str[++i])) {
		state = state();
		if (!state) break;
	}
	if (char !== '.') reject(original);
	return {
		stamp: stamp,
		id: data.slice(0, i),
		value: data.slice(i + 1)
	};
};
