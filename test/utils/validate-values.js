'use strict';

var Db = require('../../');

module.exports = function (t, a) {
	var Ns = Db.create('ValidateValsTest', { foo: Db.Number.required })
	  , obj = Ns(), rel = obj._foo;

	a(t(rel, [12, 23], rel.validateValue), null, "Valid");
	a(t(rel, [12, 'raz'], rel.validateValue) instanceof Error, true, "Invalid");
};
