'use strict';

var isFunction = require('es5-ext/lib/Function/is-function')
  , root       = require('./root')

  , match = String.prototype.match

  , functionRe = new RegExp('^\\s*function[\\0-\'\\)-\\uffff]*' +
		'\\(([\\0-\\(\\*-\\uffff]*)\\)\\s*\\{([\\0-\\uffff]*)\\}\\s*$')

  , FunctionType;

module.exports = FunctionType = root.create('Function', function Self(value) {
	var data;
	if (isFunction(value)) return value;
	if (value && ((data = match.call(value, functionRe)))) {
		try {
			return new Function(data[1], data[2]);
		} catch (e) {}
	}
	throw new TypeError(value + " is not function representation");
}, {
	is: isFunction,
	validate: function (value) {
		var data;
		if (isFunction(value)) return;
		if (value && ((data = match.call(value, functionRe)))) {
			try {
				new Function(data[1], data[2]); //jslint: skip
				return;
			} catch (e) {}
		}
		return new TypeError(value + " is not function representation");
	},
	normalize: function (value) {
		var data;
		if (isFunction(value)) return value;
		if (value && ((data = match.call(value, functionRe)))) {
			try {
				return new Function(data[1], data[2]);
			} catch (e) {}
		}
		return null;
	}
});

// Assign Function namespace to core properties
root._is.ns = root._normalize.ns = root._validate.ns = FunctionType;
