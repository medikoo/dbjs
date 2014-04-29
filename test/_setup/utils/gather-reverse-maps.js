'use strict';

var toArray  = require('es5-ext/array/to-array')
  , Database = require('../../../');

module.exports = function (a) {
	var db = new Database()
	  , Type1 = db.Object.extend('Test1')
	  , Type2 = db.Object.extend('Test2',
			{ foo: { type: Type1, multiple: true } })

	  , obj11, obj13, obj14, obj21, obj22, Type3, obj31, obj32;

	obj11 = new Type1({ melasa: 'dwa' });
	obj21 = new Type2({ foo: [obj11] });

	Type2.prototype.$foo.reverse = 'bar';
	a.deep(toArray(obj11.bar), [obj21], "Init");

	obj22 = new Type2({ foo: [obj11] });
	a.deep(toArray(obj11.bar), [obj21, obj22], "Add");

	Type3 = Type2.extend('Revreltest3');
	Type3.prototype.$foo.reverse = 'ola';
	Type3.prototype.$foo.unique = true;

	obj13 = new Type1({ raz: 'dwa' });
	obj14 = new Type1({ trzy: 'cztery' });

	obj31 = new Type3({ foo: [obj13] });
	obj32 = new Type3({ foo: [obj14] });

	a(obj13.ola, obj31, "Reverse unique #1");
	a(obj14.ola, obj32, "Reverse unique #2");
	a.deep(toArray(obj13.bar), [obj31], "Reverse deep #1");
	a.deep(toArray(obj14.bar), [obj32], "Reverse deep #2");

	a.h1("Turn off multiple");
	Type2.prototype.$foo.multiple = false;
	a(obj13.ola, undefined, "Reverse unique #1");
	a(obj14.ola, undefined, "Reverse unique #2");
	a.deep(toArray(obj13.bar), [], "Reverse deep #1");
	a.deep(toArray(obj14.bar), [], "Reverse deep #2");
};
