'use strict';

var ObjectType = require('../../../lib/types/object');

module.exports = function (t, a) {
	a(t(null), false, "Null");
	a(t(true), false, "Primitive");
	a(t(ObjectType), true, "Namespace");
	a(t({}), false, "Plain object");
	a(t(ObjectType.create('namespacetest')), true, "Extension");
	a(t(ObjectType({ foo: true })), false, "DB Object");
};
