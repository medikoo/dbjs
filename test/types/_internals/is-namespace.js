'use strict';

var object = require('../../../lib/types/base').object;

module.exports = function (t, a) {
	a(t(null), false, "Null");
	a(t(true), false, "Primitive");
	a(t(object), true, "Namespace");
	a(t({}), false, "Plain object");
	a(t(object.create('namespacetest')), true, "Extension");
	a(t(object({ foo: true })), false, "DB Object");
};
