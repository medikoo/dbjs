'use strict';

var Database = require('../../../');

module.exports = function (t, a) {
	var db = new Database(), obj = new db.Object();

	a.deep(t(obj, 'foo'), { object: obj, key: 'foo' });

	obj.define('someNested', {
		type: db.Object,
		nested: true
	});
	a.deep(t(obj, 'someNested/foo'), { object: obj.someNested, key: 'foo' });

	obj.someNested.define('otherNested', {
		type: db.Object,
		nested: true
	});
	a.deep(t(obj, 'someNested/otherNested/foo'), { object: obj.someNested.otherNested, key: 'foo' });
};
