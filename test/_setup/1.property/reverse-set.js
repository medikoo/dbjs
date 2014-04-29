'use strict';

var toArray  = require('es5-ext/array/to-array')
  , Database = require('../../../');

module.exports = function (a) {
	var db = new Database()
	  , Type1 = db.Object.extend('Test1')
	  , Type2 = db.Object.extend('Test2',
			{ foo: { type: Type1 } })

	  , obj11, obj21, obj22;

	obj11 = new Type1({ melasa: 'dwa' });
	obj21 = new Type2({ foo: obj11 });

	Type2.prototype.$foo.reverse = 'bar';
	obj22 = new Type2({ foo: obj11 });
	a.deep(toArray(obj11.bar), [obj21, obj22], "Init");

	a(obj11.bar.last, obj22, "Last");
	a(obj11.bar.lastEvent, obj22.$foo._lastEvent_, "Last Event");

	a.h1("Delete");
	a(obj11.bar.delete(obj11), false, "Other");
	a(obj11.bar.delete(obj21), true, "Existing");
	a.deep(toArray(obj11.bar), [obj22], "Reverse");
	a.deep(obj21.foo, undefined, "Value");

	a.h1("Add");
	a(obj11.bar.add(obj21), obj11.bar);
	a.deep(toArray(obj11.bar), [obj22, obj21], "Reverse");
	a.deep(obj21.foo, obj11, "Value");

	a.h1("Clear");
	a(obj11.bar.clear(), undefined);
	a.deep(toArray(obj11.bar), [], "Reverse");
	a.deep(obj21.foo, undefined, "Value #1");
	a.deep(obj22.foo, undefined, "Value #1");
};
