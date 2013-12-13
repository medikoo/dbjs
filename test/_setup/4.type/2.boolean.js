'use strict';

var setPrototypeOf = require('es5-ext/object/set-prototype-of')
  , Database       = require('../../../');

module.exports = function (a) {
	var db = new Database(), Type = db.Boolean;

	a(Type(undefined), false, "Undefined");
	a(Type(null), false, "Null");
	a(Type(false), false, "Boolean (primitive)");
	a(Type(new Boolean(false)), true, "Boolean (object)"); //jslint: skip
	a(Type({}), true, "Object");
	a(Type('false'), true, "False string");
	a(Type(''), false, "Empty string");
	a(Type('0'), true, "Other false string");
	a(Type(0), false, "Zero");
	return {
		"Is": function (a) {
			a(Type.is(undefined), false, "Undefined");
			a(Type.is(null), false, "Null");
			a(Type.is(false), true, "Boolean (primitive)");
			a(Type.is(new Boolean(false)), false, "Boolean (object)"); //jslint: skip
			a(Type.is({}), false, "Object");
			a(Type.is('false'), false, "False string");
			a(Type.is(''), false, "Empty string");
			a(Type.is('0'), false, "Other false string");
			a(Type.is(0), false, "Zero");
		},
		"Normalize": function (a) {
			a(Type.normalize(undefined), false, "Undefined");
			a(Type.normalize(null), false, "Null");
			a(Type.normalize(false), false, "Boolean (primitive)");
			a(Type.normalize(new Boolean(false)), true, //jslint: skip
				"Boolean (object)");
			a(Type.normalize({}), true, "Object");
			a(Type.normalize('false'), true, "False string");
			a(Type.normalize(''), false, "Empty string");
			a(Type.normalize('0'), true, "Other false string");
			a(Type.normalize(0), false, "Zero");
		},
		"Validate": function (a) {
			a(Type.validate(undefined), false, "Undefined");
			a(Type.validate(null), false, "Null");
			a(Type.validate(false), false, "Boolean (primitive)");
			a(Type.validate(new Boolean(false)), true, //jslint: skip
				"Boolean (object)");
			a(Type.validate({}), true, "Object");
			a(Type.validate('false'), true, "False string");
			a(Type.validate(''), false, "Empty string");
			a(Type.validate('0'), true, "Other false string");
			a(Type.validate(0), false, "Zero");
		},
		"toString": function (a) {
			var x = new Boolean(true); //jslint: skip
			setPrototypeOf(x, Type.prototype);
			a(String(x), 'True', "True");
			x = new Boolean(false);  //jslint: skip
			setPrototypeOf(x, Type.prototype);
			a(String(x), 'False', "False");
		}
	};
};
