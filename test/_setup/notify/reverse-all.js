'use strict';

var toArray  = require('es6-iterator/to-array')
  , Database = require('../../../');

module.exports = function (a) {
	var db = new Database()
	  , Type1 = db.Object.extend('Test1')
	  , Type2 = db.Object.extend('Test2',
			{ foo: { type: Type1, required: true } })

	  , obj11, obj21, obj22;

	obj11 = new Type1({ melasa: 'dwa' });
	obj21 = new Type2({ foo: obj11 });
	obj22 = new Type2({ foo: obj11 });

	Type2.prototype.$foo.reverse = 'bar';
	a.deep(toArray(obj11.bar), [obj21, obj22], "Pre");
	Type2.prototype.$foo.reverse = 'revreltest2';
	a(obj11.bar, undefined, "Rename: old");
	a.deep(toArray(obj11.revreltest2), [obj21, obj22], "Rename: new");
};
