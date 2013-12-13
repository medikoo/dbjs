'use strict';

var Database = require('../../../');

module.exports = function (a) {
	var db = new Database(), fn = function (raz) {};

	a(db.Base('234'), '234', "Base");
	a(db.Boolean('234'), true, "Boolean");
	a(db.Number('234'), 234, "Number");
	a(db.String(234), '234', "String");
	a(db.DateTime(2010, 1, 1).getTime(), (new Date(2010, 1, 1)).getTime(),
		"DateTime");
	a(db.RegExp('raz').test('raz'), true, "RegExp");
	a(db.Function(fn), fn, "Function");
	a(typeof db.Object().__id__, 'string', "Object");
};
