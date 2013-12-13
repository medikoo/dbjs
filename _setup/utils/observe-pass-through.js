'use strict';

var isObservableValue = require('observable-value/is-observable-value');

module.exports = function (value) {
	if (!isObservableValue(value)) return value;
	return value.value;
};
