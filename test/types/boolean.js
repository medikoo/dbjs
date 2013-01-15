'use strict';

var serialize = require('../../lib/utils/serialize');

module.exports = function (t, a) {
	a(t(undefined), false, "Undefined");
	a(t(null), false, "Null");
	a(t(false), false, "Boolean (primitive)");
	a(t(new Boolean(false)), true, "Boolean (object)");
	a(t({}), true, "Object");
	a(t('false'), true, "False string");
	a(t(''), false, "Empty string");
	a(t('0'), true, "Other false string");
	a(t(0), false, "Zero");
	return {
		"Is": function (a) {
			a(t.is(undefined), false, "Undefined");
			a(t.is(null), false, "Null");
			a(t.is(false), true, "Boolean (primitive)");
			a(t.is(new Boolean(false)), false, "Boolean (object)");
			a(t.is({}), false, "Object");
			a(t.is('false'), false, "False string");
			a(t.is(''), false, "Empty string");
			a(t.is('0'), false, "Other false string");
			a(t.is(0), false, "Zero");
		},
		"Normalize": function (a) {
			a(t.normalize(undefined), false, "Undefined");
			a(t.normalize(null), false, "Null");
			a(t.normalize(false), false, "Boolean (primitive)");
			a(t.normalize(new Boolean(false)), true, "Boolean (object)");
			a(t.normalize({}), true, "Object");
			a(t.normalize('false'), true, "False string");
			a(t.normalize(''), false, "Empty string");
			a(t.normalize('0'), true, "Other false string");
			a(t.normalize(0), false, "Zero");
		},
		"ValidateCreate": function (a) {
			a(t.prototype.validateCreate(undefined), null, "Undefined");
			a(t.prototype.validateCreate(null), null, "Null");
			a(t.prototype.validateCreate(false), null, "Boolean (primitive)");
			a(t.prototype.validateCreate(new Boolean(false)), null,
				"Boolean (object)");
			a(t.prototype.validateCreate({}), null, "Object");
			a(t.prototype.validateCreate('false'), null, "False string");
			a(t.prototype.validateCreate(''), null, "Empty string");
			a(t.prototype.validateCreate('0'), null, "Other false string");
			a(t.prototype.validateCreate(0), null, "Zero");
		},
		"Serialize": function (a) {
			a(t._serialize_(true), serialize(true), "#1");
			a(t._serialize_(false), serialize(false), "#2");
		}
	};
};
