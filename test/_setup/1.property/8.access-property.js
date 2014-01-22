'use strict';

var toArray  = require('es6-iterator/to-array')
  , isSet    = require('es6-set/is-set')
  , Database = require('../../../');

module.exports = function (a) {
	var db = new Database(), proto = db.Object.prototype, obj = new db.Object()
	  , args, x = {}, i, desc;

	a.h1("Set");
	a(obj.set('test', 'foo'), obj);
	a(obj.test, 'foo', "Value");

	a.h1("Set properties");
	a(obj.setProperties({
		raz: 23,
		dwa: 2
	}), obj);
	a(obj.raz, 23, "Value");
	a(obj.dwa, 2, "Value #2");

	a.h1("Define");
	a(proto.define('hola', {
		type: db.Boolean,
		required: true
	}), proto);
	obj.hola = 'foo';
	a(obj.hola, true, "Type");

	a.h1("Define properties");
	a(proto.defineProperties({
		farza: {
			type: db.Boolean,
			required: true,
			value: 'elo'
		},
		merso: {
			type: db.Number,
			multiple: true
		}
	}), proto);
	a(obj.farza, true, "Value #1");
	a(isSet(obj.merso), true, "Value #2");

	a.h1("Delete");
	a(obj.delete('test'), true);
	a(obj.delete('test'), false, "Undefined");

	a.h1("Entries");
	a.deep(toArray(obj.entries()), args = [[ 'raz', 23 ],
		[ 'dwa', 2 ],
		[ 'hola', true ],
		[ 'farza', true ],
		[ 'merso', obj.merso ]]);

	a.h1("ForEach");
	i = 0;
	obj.forEach(function (value, key, map) {
		var data = args[i++];
		a(this, x, "Context #" + i);
		a(value, data[1], "Value #" + i);
		a(key, data[0], "Key #" + i);
		a(map, obj, "Map #" + i);
	}, x);

	a.h1("Get");
	a(obj.get('dwa'), 2);
	a(obj.get(x), undefined, "Invalid");

	a.h1("Has");
	a(obj.has('dwa'), true);
	a(obj.has('test'), false, "Deleted");
	a(obj.has(x), false, "Invalid");

	a.h1("Keys");
	a.deep(toArray(obj.keys()), args.map(function (val) { return val[0]; }));

	a.h1("Values");
	a.deep(toArray(obj.values()), args.map(function (val) { return val[1]; }));

	a.h1("Size");
	a(obj.size, args.length);

	a.h1("Clear");
	a.throws(function () {
		obj.clear();
	}, 'CLEAR_ERROR', "Required");
	proto.$hola.required = false;
	obj.clear();
	a(obj.size, 2);

	a.h1("Nested By Proto");
	obj = new db.Object();
	desc = obj._descriptorPrototype_;
	desc.nested = true;
	desc.type = db.Object;
	a(obj.get('foo').__id__, obj.__id__ + '/foo', "Value");
	a(obj.size, 3, "Size");
};
