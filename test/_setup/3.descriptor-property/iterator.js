'use strict';

var toArray    = require('es6-iterator/to-array')
  , Database   = require('../../../');

module.exports = function (a) {
	var db = new Database(), obj = new db.Object(), iterator, data, desc;

	desc = obj.$getOwn('test');
	desc.set('test', 'foo');

	desc.setProperties({
		raz: 23,
		dwa: 2
	});

	iterator = desc.entries();
	desc.set('marko', 'elo');
	desc.delete('raz');
	a.deep(toArray(iterator).slice(5),
		data = [['test', 'foo'], [ 'dwa', 2 ], ['marko', 'elo']], "Modified");
	a.deep(toArray(desc).slice(5), data, "Default iterator");
};
