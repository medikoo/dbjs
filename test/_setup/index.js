'use strict';

var toArray  = require('es5-ext/array/to-array')
  , Database = require('../../')
  , Event    = require('../../_setup/event')

  , getPrototypeOf = Object.getPrototypeOf;

module.exports = function (a) {
	var db = new Database(), obj1 = new db.Object(), obj2 = new db.Object(), desc
	  , Type1, Type2, Type3, item1;

	a(db.objects.has(db.String.prototype), true, "Objects: Native objects");
	a(db.objects.has(obj1) && db.objects.has(obj2), true,
		"Objects: User objects");

	a.deep(toArray(db.Object.prototype.__descendants__).sort(),
		[obj1, obj2].sort(), "Descendants");

	a(obj1.database, db, "Database reference");

	desc = db.Object.prototype.__descriptorPrototype__;
	a(desc.__id__, '$', "Descriptor prototype");
	a(desc.__descriptorPrototype__.__id__, '/', "Descriptor decriptor prototype");
	a(db.Object.prototype.__itemPrototype__.__id__, '*', "Item prototype");

	a(obj1._lastOwnEvent_ instanceof Event, true, "Last own event");
	a(typeof obj1._lastOwnModified_, 'number', "Last own modified");
	a(obj1._lastEvent_ instanceof Event, true, "Last event");
	a(typeof obj1.lastModified, 'number', "Last modified");

	a(obj1._history_[0] instanceof Event, true, "History");

	a(db.objects.unserialize(obj1.__id__), obj1, "Unserialize");

	a.h1("Kind");
	a(obj1._kind_, 'object', "Object");
	a(db.Object._kind_, 'object', "Type");
	a(obj1.$getOwn('foo')._kind_, 'descriptor', "Descriptor");
	a(obj1.$getOwn('foo').$getOwn('bar')._kind_, 'sub-descriptor',
		"Sub Descriptor");
	a(obj1._getMultiple_('bar').$getOwn('bar')._kind_, 'item', "Multiple item");

	a.h1("Delete object");

	a.h2("Descriptor");
	a.h3("Singular");
	obj2 = new db.Object();
	obj2.define('mara', { required: true, value: 'raz' });
	desc = obj2.$mara;
	a.h4("Pre");
	a(desc._value_, 'raz', "Value");
	a(desc.$required._value_, true, "Property descriptor");
	db.objects.delete(desc);
	a.h3("Post");
	a(desc.hasOwnProperty('_value_'), false, "Value");
	a(desc.$required.hasOwnProperty('_value_'), false, "Property descriptor");

	a.h3("Multiple");
	desc = obj2.$getOwn('mordka');
	desc.multiple = true;
	obj2.mordka = ['foo', 'bar'];
	item1 = obj2.mordka.$getOwn('foo');
	a.h4("Pre");
	a(desc.$multiple._value_, true, "Property descriptor");
	a(item1._value_, true, "Item");
	db.objects.delete(desc);
	a.h4("Post");
	a(desc.$multiple.hasOwnProperty('_value_'), false, "Property descriptor");
	a(item1.hasOwnProperty('_value_'), false, "Item");

	a.h2("Object");
	obj1 = new db.Object();
	obj1.defineProperties({
		raz: { required: true, value: 'dwa' },
		dwa: { multiple: true, value: ['foo', 'bar'] }
	});
	a.h3("Pre");
	a(obj1.$raz.$required._value_, true, "Property descriptor");
	a(obj1.$raz._value_, 'dwa', "Property value");
	a(obj1.$dwa.$multiple._value_, true, "Property descriptor #2");
	a(obj1.$raz._value_, 'dwa', "Property value #2");
	item1 = obj1.dwa.$getOwn('foo');
	a(item1._value_, true, "Item");
	db.objects.delete(obj1);

	a.h3("Post");
	a(obj1.$raz.$required.hasOwnProperty('_value_'), false,
		"Property descriptor");
	a(obj1.$raz.hasOwnProperty('_value_'), false, "Property value");
	a(obj1.$dwa.$multiple.hasOwnProperty('_value_'), false,
		"Property descriptor #2");
	a(obj1.$raz.hasOwnProperty('_value_'), false, "Property value #2");
	a(item1.hasOwnProperty('_value_'), false, "Item");

	a.h2("Type");
	Type1 = db.Object.extend('Type1', {
		foo: { multiple: true },
		bar: { required: true }
	});
	Type2 = Type1.extend('Type2');

	Type2.prototype.set('marko', 'bar');

	obj2 = new Type2({ foo: ['raz'], bar: 'sdfs' });
	obj1 = new Type1({ foo: ['dwa'], bar: 'sdsfee' });

	Type3 = db.Object.extend('Type3');
	Type3.prototype.defineProperties({
		elo: { type: Type2 },
		marko: { type: Type1 }
	});

	db.objects.delete(Type1);
	a.h3("Object");
	a(getPrototypeOf(obj1), db.Base.prototype, "Deleted");
	a(obj1.foo, undefined, "Descriptor: Multiple");
	a(obj1.bar, undefined, "Descriptor");
	a.h3("Descending object");
	a(getPrototypeOf(obj2), db.Base.prototype, "Deleted");
	a(obj1.foo, undefined, "Descriptor: Multiple");
	a(obj1.bar, undefined, "Descriptor");
	a.h3("Property type");
	a(Type3.prototype.$elo.type, db.Base, "Extension");
	a(Type3.prototype.$marko.type, db.Base, "");
};
