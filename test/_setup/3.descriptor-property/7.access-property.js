'use strict';

var toArray    = require('es6-iterator/to-array')
  , Database   = require('../../../')
  , getBaseMap = require('./_get-base-map');

module.exports = function (a) {
	var db = new Database(), obj = new db.Object()
	  , args, x = {}, i, desc = obj.$get('test'), base = getBaseMap(desc);

	a.h1("Set");
	a(desc.set('test', 'foo'), desc);
	a(desc.test, 'foo', "Value");

	a.h1("Set properties");
	a(desc.setProperties({
		raz: 23,
		dwa: 2
	}), desc);
	a(desc.raz, 23, "Value");
	a(desc.dwa, 2, "Value #2");

	a.h1("Delete");
	a(desc.delete('test'), true);
	a(desc.delete('test'), false, "Undefined");

	a.h1("Entries");
	a.deep(toArray(desc.entries()), args = base.concat([[ 'raz', 23 ],
		[ 'dwa', 2 ]]));

	a.h1("ForEach");
	i = 0;
	desc.forEach(function (value, key, map) {
		var data = args[i++];
		a(this, x, "Context #" + i);
		a(value, data[1], "Value #" + i);
		a(key, data[0], "Key #" + i);
		a(map, desc, "Map #" + i);
	}, x);

	a.h1("Get");
	a(desc.get('dwa'), 2);
	a(desc.get(x), undefined, "Invalid");

	a.h1("Has");
	a(desc.has('dwa'), true);
	a(desc.has('test'), false, "Deleted");
	a(desc.has(x), false, "Invalid");

	a.h1("Keys");
	a.deep(toArray(desc.keys()), args.map(function (val) { return val[0]; }));

	a.h1("Values");
	a.deep(toArray(desc.values()), args.map(function (val) { return val[1]; }));

	a.h1("Size");
	a(desc.size, args.length);

	a.h1("Clear");
	desc.clear();
	a(desc.size, base.length);

};
