'use strict';

var Database = require('../../../')

  , keys = Object.keys;

module.exports = function (t, a) {
	var db = new Database(), obj = new db.Object();

	obj.set('foo', 'bar');
	a.deep(keys(obj), ['foo'], "Set");
	obj.delete('foo');
	a.deep(keys(obj), [], "Delete");
};
