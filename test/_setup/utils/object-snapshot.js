'use strict';

var Database = require('../../../');

module.exports = function (t, a) {
	var db = new Database(), obj1;

	obj1 = new db.Object();
	obj1.defineProperties({
		raz: { required: true, value: 'dwa' },
		dwa: { multiple: true, value: ['foo', 'bar'] },
		trzy: { nested: true, type: db.Object }
	});
	obj1.trzy.set('marko', 'zagalo');
	a.deep(t(obj1), [obj1._lastEvent_, obj1.$raz.$required._lastEvent_,
		obj1.$raz._lastEvent_, obj1.$dwa.$multiple._lastEvent_,
		obj1.dwa.$get('foo')._lastEvent_, obj1.dwa.$get('bar')._lastEvent_,
		obj1.$trzy.$nested._lastEvent_, obj1.$trzy.$type._lastEvent_,
		obj1.trzy.$marko._lastEvent_]);
};
