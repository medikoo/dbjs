'use strict';

var toArray  = require('es5-ext/array/to-array')
  , isSet    = require('es6-set/is-set')
  , Database = require('../../../');

module.exports = function (a) {
	var db = new Database(), Type1 = db.Object.extend('Test1',
		{ foo: { type: db.String, multiple: true } })
	  , type1 = Type1.prototype, Type2, type2, Type3, type3, type5
	  , values, i, x = {};

	a.h1("Set property on Type");
	a(isSet(type1.foo), true);
	a.deep(toArray(type1.foo), [], "Content");
	a(type1.foo.size, 0, "Size");
	a(type1.foo.has('foo'), false, "Has");
	a(type1.foo.has({}), false, "Has: Invalid");

	Type2 = Type1.extend('Relsettest2', {
		foo: { value: ['raz', 'dwa', 13, 'trzy'] }
	});
	type2 = Type2.prototype;

	a.h1("Extension");
	a.deep(toArray(type2.foo), ['raz', 'dwa', '13', 'trzy'], "Content");
	a(type2.foo.size, 4, "Size");
	a(type2.foo.has(13), true, "Has: true");
	a(type2.foo.has('pięć'), false, "Has: false");

	a.h2("Base");
	a.deep(toArray(type1.foo), [], "Content");
	a(type1.foo.size, 0, "Size");
	a(type1.foo.has(13), false, "Has");

	a.h1("Reset");
	type1.foo = ['misko'];
	a.deep(toArray(type1.foo), ['misko'], "Content");
	a(type1.foo.size, 1, "Size");
	a(type1.foo.has('misko'), true, "Has: true");
	a(type1.foo.has('pięć'), false, "Has: false");

	a.h1("Add");
	type1.foo.add('marko');
	a.deep(toArray(type1.foo), ['misko', 'marko'], "Content");
	a(type1.foo.size, 2, "Size");
	a(type1.foo.has('marko'), true, "Has: true");
	a(type1.foo.has('pięć'), false, "Has: false");

	a.h2("Extension");
	a.deep(toArray(type2.foo), ['raz', 'dwa', '13', 'trzy', 'misko', 'marko'],
		"Content");
	a(type2.foo.size, 6, "Size");
	a(type2.foo.has('dwa'), true, "Has: #1");
	a(type2.foo.has('marko'), true, "Has: #2");

	a.h1("Clear");
	type2.foo.clear();
	a.deep(toArray(type2.foo), ['misko', 'marko'], "Content");
	a(type2.foo.size, 2, "Size");
	a(type2.foo.has('marko'), true, "Has: true");
	a(type2.foo.has('raz'), false, "Has: false");

	a.h1("Prototype add");
	type1.foo.add('next');
	a.deep(toArray(type2.foo), ['misko', 'marko', 'next'], "Content");
	a(type2.foo.size, 3, "Size");
	a(type2.foo.has('next'), true, "Has: true");
	a(type2.foo.has('raz'), false, "Has: false");

	a.h1("Base add");
	a.h2("Prototype");
	type2.foo.add('lorem');
	a.deep(toArray(type1.foo), ['misko', 'marko', 'next'], "Content");
	a(type1.foo.size, 3, "Size");
	a(type1.foo.has('misko'), true, "Has: true");
	a(type1.foo.has('lorem'), false, "Has: false");
	a.h2();
	a.deep(toArray(type2.foo), ['misko', 'marko', 'next', 'lorem'], "Content");
	a(type2.foo.size, 4, "Size");
	a(type2.foo.has('lorem'), true, "Has: true");
	a(type2.foo.has('trzy'), false, "Has: false");

	a.h1("Base delete");
	type2.foo.delete('misko');
	a.h2("Prototype");
	a.deep(toArray(type1.foo), ['misko', 'marko', 'next'], "Content");
	a(type1.foo.size, 3, "Size");
	a(type1.foo.has('misko'), true, "Has: true");
	a(type1.foo.has('lorem'), false, "Has: false");
	a.h2();
	a.deep(toArray(type2.foo), ['misko', 'marko', 'next', 'lorem'], "Content");
	a(type2.foo.size, 4, "Size");
	a(type2.foo.has('next'), true, "Has: #1");
	a(type2.foo.has('misko'), true, "Has: #2");

	a.h1("Another extension");
	Type3 = Type2.extend('Reltest3');
	type3 = Type3.prototype;
	a.deep(toArray(type3.foo), ['misko', 'marko', 'next', 'lorem'], "Content");
	a(type3.foo.size, 4, "Size");
	a(type3.foo.has('marko'), true,
		"Has: Deep 1");
	a(type3.foo.has('misko'), true, "Has: Deep 2");

	a.h2("Add");
	type3.foo.add('topl');
	a.h3("Deep 2");
	a.deep(toArray(type1.foo), ['misko', 'marko', 'next'], "Content");
	a(type1.foo.size, 3, "Size");
	a(type1.foo.has('marko'), true, "Has: true");
	a(type1.foo.has('topl'), false, "Has: false");
	a.h3("Deep 1");
	a.deep(toArray(type2.foo), ['misko', 'marko', 'next', 'lorem'], "Content");
	a(type2.foo.size, 4, "Size");
	a(type2.foo.has('marko'), true, "Has: true");
	a(type2.foo.has('topl'), false, "Has: false");
	a.h3("Base");
	a.deep(toArray(type3.foo), ['misko', 'marko', 'next', 'lorem', 'topl'],
		"Content");
	a(type3.foo.size, 5, "Size");
	a(type3.foo.has('topl'), true, "Has: true");
	a(type3.foo.has('misko'), true, "Has: Deep");

	a.h2("Delete");
	type3.foo.delete('marko');
	a.h3("Deep 2");
	a.deep(toArray(type1.foo), ['misko', 'marko', 'next'], "Content");
	a(type1.foo.size, 3, "Size");
	a(type1.foo.has('marko'), true, "Has: true");
	a(type1.foo.has('topl'), false, "Has: false");
	a.h3("Deep 1");
	a.deep(toArray(type2.foo), ['misko', 'marko', 'next', 'lorem'], "Content");
	a(type2.foo.size, 4, "Size");
	a(type2.foo.has('marko'), true, "Has: true");
	a(type2.foo.has('topl'), false, "Has: false");
	a.deep(toArray(type3.foo), ['misko', 'marko', 'next', 'lorem', 'topl'],
		"Content");
	a(type3.foo.size, 5, "Size");
	a(type3.foo.has('topl'), true, "Has: true");
	a(type3.foo.has('marko'), true, "Has: false");

	a.h2("Delete deep 1");
	type2.foo.delete('lorem');
	a.h3("Deep 2");
	a.deep(toArray(type1.foo), ['misko', 'marko', 'next'], "Content");
	a(type1.foo.size, 3, "Size");
	a(type1.foo.has('marko'), true, "Has: true");
	a(type1.foo.has('lorem'), false, "Has: false");
	a.h3("Deep 1");
	a.deep(toArray(type2.foo), ['misko', 'marko', 'next'], "Content");
	a(type2.foo.size, 3, "Size");
	a(type2.foo.has('marko'), true, "Has: true");
	a(type2.foo.has('lorem'), false, "Has: false");
	a.h3("Base");
	a.deep(toArray(type3.foo), ['misko', 'marko', 'next', 'topl'], "Content");
	a(type3.foo.size, 4, "Size");
	a(type3.foo.has('topl'), true, "Has: true");
	a(type3.foo.has('lorem'), false, "Has: false");

	a.h1("Deep 1, set multiple false");
	type2.$foo.multiple = false;
	a.h2("Deep 2");
	a.deep(toArray(type1.foo), ['misko', 'marko', 'next'], "Content");
	a(type1.foo.size, 3, "Size");
	a(type1.foo.has('marko'), true, "Has: true");
	a(type1.foo.has('lorem'), false, "Has: false");
	a.h2();
	a(type2.foo, undefined, "Deep 1");
	a(type3.foo, undefined, "Base");

	a.h1("Base, set multiple false");
	type3.$foo.multiple = true;
	a.h2("Deep 2");
	a.deep(toArray(type1.foo), ['misko', 'marko', 'next'], "Content");
	a(type1.foo.size, 3, "Size");
	a(type1.foo.has('marko'), true, "Has: true");
	a(type1.foo.has('lorem'), false, "Has: false");
	a.h2();
	a(type2.foo, undefined, "Deep 1");
	a.h2("Base");
	a.deep(toArray(type3.foo), ['misko', 'marko', 'next', 'topl'], "Content");
	a(type3.foo.size, 4, "Size");
	a(type3.foo.has('topl'), true, "Has: true");
	a(type3.foo.has('lorem'), false, "Has: false");

	a.h1("Deep 1, Reset value");
	type2.foo = 'radzio';
	a.h2("Deep 2");
	a.deep(toArray(type1.foo), ['misko', 'marko', 'next'], "Content");
	a(type1.foo.size, 3, "Size");
	a(type1.foo.has('marko'), true, "Has: true");
	a(type1.foo.has('lorem'), false, "Has: false");
	a.h2();
	a(type2.foo, 'radzio', "Deep 1");
	a.h2("Base");
	a.deep(toArray(type3.foo), ['misko', 'marko', 'next', 'topl'], "Content");
	a(type3.foo.size, 4, "Size");
	a(type3.foo.has('topl'), true, "Has: true");
	a(type3.foo.has('lorem'), false, "Has: false");

	a.h1("Deep 1, set multiple true");
	type2.$foo.multiple = true;
	a.h2("Deep 2");
	a.deep(toArray(type1.foo), ['misko', 'marko', 'next'], "Content");
	a(type1.foo.size, 3, "Size");
	a(type1.foo.has('marko'), true, "Has: true");
	a(type1.foo.has('lorem'), false, "Has: false");
	a.h2("Deep 1");
	a.deep(toArray(type2.foo), ['misko', 'marko', 'next'], "Content");
	a(type2.foo.size, 3, "Size");
	a(type2.foo.has('marko'), true, "Has: true");
	a(type2.foo.has('lorem'), false, "Has: false");
	a.h2("Base");
	a.deep(toArray(type3.foo), ['misko', 'marko', 'next', 'topl'], "Content");
	a(type3.foo.size, 4, "Size");
	a(type3.foo.has('topl'), true, "Has: true");
	a(type3.foo.has('lorem'), false, "Has: false");

	type5 = Type3.extend('Reltest4').extend('Reltest5').prototype;
	a(type5.foo.has('topl'), true, "Deep extension: Has: true");
	a(type5.foo.has('lorem'), false, "Deep extension: Has: false");

	values = ['misko', 'marko', 'next', 'topl'];
	a.h1("Entries");
	a.deep(toArray(type3.foo.entries()),
		values.map(function (val) { return [val, val]; }));

	a.h1("ForEach");
	i = 0;
	type3.foo.forEach(function (value, key, set) {
		var data = values[i++];
		a(this, x, "Context #" + i);
		a(value, data, "Value #" + i);
		a(key, data, "Key #" + i);
		a(set, type3.foo, "Seet #" + i);
	}, x);

	a.h1("Values");
	a.deep(toArray(type3.foo.values()), values);

	a.h1("Clear");
	a(type3.foo.clear(), undefined);
	a.deep(toArray(type3.foo), ['misko', 'marko', 'next'], "Content");
	a(type1.foo.clear(), undefined);
	a.deep(toArray(type1.foo), [], "Content");
	a.deep(toArray(type3.foo), [], "Deep Content");
};
