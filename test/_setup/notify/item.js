'use strict';

var toArray  = require('es6-iterator/to-array')
  , Database = require('../../../');

module.exports = function (a) {
	var db = new Database(), obj = new db.Object(), iterator, data, event;

	db.Object.prototype.$get('test').multiple = true;

	obj.test = ['raz', 2, 'trzy', 4];

	iterator = obj.test.values();
	obj.test.add('pięć');
	obj.test.delete(2);
	a.deep(toArray(iterator), data = ['raz', 'trzy', 4, 'pięć'], "Modified");
	a.deep(toArray(obj.test), data, "Default iterator");

	obj.test.on('change', function (e) { event = e; });

	obj.test.add('foo');
	a.deep(event, { type: 'add', value: 'foo', dbjs: event.dbjs },
		"Multiple event");
};
