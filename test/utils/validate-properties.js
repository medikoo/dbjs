'use strict';

var Db = require('../../');

module.exports = function (t, a) {
	var Ns = Db.create('ValidatePropsTest', { foo: Db.String.required })
	  , obj = new Ns();

	a(t(obj, { marko: 'bar' }, obj.validateProperty), null, "Valid");
	a(t(obj, { foo: null }, obj.validateProperty) instanceof Error, true,
		"Invalid");
};
