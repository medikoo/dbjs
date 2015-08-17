'use strict';

var Database = require('../../../');

module.exports = function (t, a) {
	var db = new Database(), obj = new db.Object(), result;

	a.deep(t(obj, 'foo'), { object: obj, sKey: 'foo' });

	obj.define('someNested', {
		type: db.Object,
		nested: true
	});
	a.deep(t(obj, 'someNested/foo'), { object: obj.someNested, sKey: 'foo' });

	obj.someNested.define('otherNested', {
		type: db.Object,
		nested: true
	});
	result = t(obj, 'someNested/otherNested/foo');
	a.deep(result, { object: obj.someNested.otherNested, sKey: 'foo' });
	a(result.descriptor, obj.__descriptorPrototype__);
	a(result.ownDescriptor, obj.someNested.otherNested.getOwnDescriptor('foo'));
	a(result.observable, obj.someNested.otherNested._foo);
	obj.someNested.otherNested.foo = 'raz';
	a(result.value, 'raz');

	obj.define('otherObj', {
		type: db.Object
	});
	obj.set('otherObj', new db.Object({ foo: 'elo' }));
	result = t(obj, 'otherObj/foo');
	a.deep(result, { object: obj.otherObj, sKey: 'foo' });
};
