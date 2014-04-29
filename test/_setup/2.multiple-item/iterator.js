'use strict';

var toArray  = require('es5-ext/array/to-array')
  , Database = require('../../../');

module.exports = function (a) {
	var db = new Database(), obj = new db.Object(), iterator, data;

	db.Object.prototype.$getOwn('test').multiple = true;

	obj.test = ['raz', 2, 'trzy', 4];

	iterator = obj.test.values();
	obj.test.add('pięć');
	obj.test.delete(2);
	a.deep(toArray(iterator), data = ['raz', 'trzy', 4, 'pięć'], "Modified");
	a.deep(toArray(obj.test), data, "Default iterator");
};
