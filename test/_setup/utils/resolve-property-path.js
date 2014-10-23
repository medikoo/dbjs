'use strict';

var Database = require('../../../');

module.exports = function (t, a) {
	var db = new Database(), obj = new db.Object(), result;

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
	result = t(obj, 'someNested/otherNested/foo');
	a.deep(result, { object: obj.someNested.otherNested, key: 'foo' });
	a(result.descriptor, obj.__descriptorPrototype__);
	a(result.ownDescriptor, obj.someNested.otherNested.getOwnDescriptor('foo'));
	a(result.observable, obj.someNested.otherNested._foo);
};
