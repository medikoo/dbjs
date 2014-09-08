'use strict';

var toArray  = require('es5-ext/array/to-array')
  , Database = require('../../../');

module.exports = function (a) {
	var db = new Database(), Type1, Type2, Type3, set;

	Type1 = db.Object.extend('Type1');
	Type2 = db.Object.extend('Type2');
	Type3 = Type1.extend('Type3');
	db.Base.extend('Type4');

	set = db.Object.extensions;
	a.deep(toArray(set), [Type1, Type2, Type3]);

	Type3.extend('Type5');
	a.deep(toArray(set), [Type1, Type2, Type3, db.Type5], "Create");

	a(db.Object.extensions.first, Type1, "First");

};
