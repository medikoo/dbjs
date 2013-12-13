'use strict';

var Database = require('../../../');

module.exports = function (t, a) {
	var db = new Database()
	  , obj = new db.Object();

	obj.set('foo', 'bar');
	obj.set('foo2', 'bar');

	a(t.call(obj, '$foo', '$foo2') < 0, true);
};
