'use strict';

var Database = require('../../../')
  , Event    = require('../../../_setup/event')

  , getPrototypeOf = Object.getPrototypeOf;

module.exports = function (a) {
	var db = new Database(), Type = db.Object.extend('TypeObj')
	  , obj = new Type(), protoProtoDesc, protoDesc, desc, obj1, invoked, invoked2;

	protoProtoDesc = Type.prototype._descriptorPrototype_;
	desc = obj.$getOwn('foo');
	a(getPrototypeOf(desc), protoProtoDesc, "Descriptor out of proto");
	protoDesc = db.Object.prototype.$getOwn('foo');
	a(getPrototypeOf(desc), protoDesc, "Proto turn");
	a(obj.$getOwn('foo'), desc, "Return already created");

	Type = db.Object.extend('OtherTypeObj');
	desc = Type.prototype.getOwnDescriptor('lorem');

	new Event(db.Object.prototype.getOwnDescriptor('lorem'), 'bar'); //jslint: ignore
	a(desc._value_, 'bar');
	a(getPrototypeOf(desc), db.Object.prototype.getOwnDescriptor('lorem'));

	db = new Database();
	db.Object.extend('ObjectType', {
		foo: {
			nested: true,
			type: db.Object
		},
		miszka: {
			nested: true,
			type: db.Object
		}
	});
	db.ObjectType.prototype.foo._descriptorPrototype_.type = db.Object;
	db.ObjectType.prototype.foo._descriptorPrototype_.nested = true;

	obj1 = new db.ObjectType();
	obj1.on('change', function () { invoked2 = true; });
	obj1.get('miszka');
	a(invoked2, undefined);
	a(obj1.size, 2);

	obj1.foo.on('change', function () { invoked = true; });
	obj1.foo.get('bar');
	a(invoked, true);
	invoked = false;
	a(obj1.foo.size, 1);
	db.objects.unserialize(obj1.foo.__id__ + '/elo');
	obj1.foo.get('elo');
	a(invoked, true);
	a(obj1.foo.size, 2);
};
