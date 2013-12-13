'use strict';

var toArray  = require('es6-iterator/to-array')
  , Database = require('../../../');

module.exports = function (a) {
	var db = new Database(), obj = new db.Object(), iterator, data;

	obj.set('test', 'foo');

	obj.setProperties({
		raz: 23,
		dwa: 2
	});

	iterator = obj.entries();
	obj.set('marko', 'elo');
	obj.delete('raz');
	a.deep(toArray(iterator),
		data = [['test', 'foo'], [ 'dwa', 2 ], ['marko', 'elo']], "Modified");
	a.deep(toArray(obj), data, "Default iterator");
};
