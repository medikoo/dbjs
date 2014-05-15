'use strict';

var Database = require('../../../')

  , getPrototypeOf = Object.getPrototypeOf;

module.exports = function (a) {
	var db = new Database(), Base = db.Base, ObjectType = db.Object, Type1, obj1
	  , TypeNew, objNew, prop, unserialize = db.objects.unserialize, objn, desc
	  , item;

	Type1 = db.Object.extend('ObjTests', { foo: { type: db.String },
		bar: { type: db.String, multiple: true } });
	obj1 = new Type1({ foo: 'raz', bar: ['dwa', 'trzy'] });

	// Type
	a.h1("Object");
	a.h2("Constructor");
	a.h3("Existing");
	a(unserialize('String'), db.String);
	a(unserialize('String#'), db.String.prototype, "Prototype");

	a.h3("Not existing");
	TypeNew = unserialize('ObjNewreateTest1');
	a(TypeNew.__id__, 'ObjNewreateTest1', "Id");
	a(getPrototypeOf(TypeNew), Base, "Prototype");

	a.h4("Proposed proto");
	TypeNew = unserialize('ObjNewreateTest2', db.String);
	a(TypeNew.__id__, 'ObjNewreateTest2', "Id");
	a(getPrototypeOf(TypeNew), db.String, "Prototype");

	// Prototype
	a.h2("Prototype");
	a.h3("Existing");
	a(unserialize('ObjTests#'), Type1.prototype);

	a.h3("Not existing");
	TypeNew = unserialize('ObjNewreateTest11#');
	a(TypeNew.__id__, 'ObjNewreateTest11#', "Id");
	a(TypeNew.constructor.__id__, 'ObjNewreateTest11', "Constructor: Id");
	a(getPrototypeOf(TypeNew), Base.prototype, "Prototype");

	a.h4("Proposed proto");
	TypeNew = unserialize('ObjNewreateTest21#', db.String);
	a(TypeNew.__id__, 'ObjNewreateTest21#', "Id");
	a(getPrototypeOf(TypeNew), db.String.prototype, "Prototype");

	// Object
	a.h2("Object");
	a.h3("Existing");
	a(unserialize(obj1.__id__), obj1);
	a.h3("Not existing");
	objNew = unserialize('objNewreateTest1');
	a(objNew.__id__, 'objNewreateTest1', "Id");
	a(objNew.constructor, ObjectType, "Type");

	a.h4("Proposed proto");
	objNew = unserialize('objNewreateTest2', Type1);
	a(objNew.__id__, 'objNewreateTest2', "Id");
	a(objNew.constructor, Type1, "Type");

	// Property
	a.h1("Property");
	a.h2("Ident");
	a.h3("Existing");
	a(prop = unserialize(obj1.__id__ + '/foo'), obj1.$foo);
	a.h3("Not existing");
	prop = unserialize(obj1.__id__ + '/other2');
	a(prop, obj1.$other2);

	a.h3("Not existing object");
	prop = unserialize('objNewreateTest42/elok');
	a.h4("Object");
	a(prop.object.__id__, 'objNewreateTest42', "Id");
	a(prop.object.constructor, ObjectType, "Type");
	a(prop, prop.object.$elok, "Prop");

	a.h2("No Ident");
	a.h3("Existing");
	obj1.$getOwn(858);
	a(unserialize(obj1.__id__ + '/2858'), obj1.$getOwn(858));
	a.h3("Not existing");
	prop = unserialize(obj1.__id__ + '/3"marko\\\"fa;l"');
	a(prop, obj1.$getOwn('marko"fa;l'));

	a.h3("Not existing object");
	prop = unserialize('objNewreateTest499/3"kdkd\\nre"');
	a.h4("Object");
	a(prop.object.__id__, 'objNewreateTest499', "Id");
	a(prop.object.constructor, ObjectType, "Type");
	a(prop, prop.object.$getOwn('kdkd\nre'), "Prop");

	// Descriptor prototype
	a.h1("Descriptor prototype");
	a.h3("Existing");
	a(prop = unserialize(obj1._descriptorPrototype_.__id__),
		obj1._descriptorPrototype_);

	a.h3("Not existing object");
	prop = unserialize('objNewreateTest42423$');
	a.h4("Object");
	a(prop.object.__id__, 'objNewreateTest42423', "Id");
	a(prop.object.constructor, ObjectType, "Type");
	a(prop, prop.object._descriptorPrototype_, "Descriptor prototype");

	// Nested Property
	a.h1("Nested property");
	desc = obj1.$getOwn('nesti');
	desc.nested = true;
	objn = obj1.nesti;
	a.h2("Ident");
	a.h3("Existing");
	a(prop = unserialize(objn.__id__ + '/foo'), objn.$foo);
	a.h3("Not existing");
	prop = unserialize(objn.__id__ + '/other2');
	a(prop, objn.$other2);

	a.h3("Not existing object");
	prop = unserialize('objNewreateTest222/miszka/elka');
	a.h4("Object");
	a(prop.object.__id__, 'objNewreateTest222/miszka', "Id");
	a(unserialize('objNewreateTest222')._getObject_('miszka'), prop.object,
		"Owner");
	a(prop.object.constructor, Base, "Type");
	a(prop, prop.object.$elka, "Prop");
	a(prop.master, unserialize('objNewreateTest222'), "Master");
	a(prop.object.master, unserialize('objNewreateTest222'),
		"Nested obj master");

	a.h2("No Ident");
	a.h3("Existing");
	objn.$getOwn(858);
	a(unserialize(objn.__id__ + '/2858'), objn.$getOwn(858));
	a.h3("Not existing");
	prop = unserialize(objn.__id__ + '/3"marko\\\"fa;l"');
	a(prop, objn.$getOwn('marko"fa;l'));

	a.h3("Not existing object");
	prop = unserialize('objNewreateTest49349/3"kdkd\\nre"/figura');
	a.h4("Object");
	a(prop.object.__id__, 'objNewreateTest49349/3"kdkd\\nre"', "Id");
	a(unserialize('objNewreateTest49349')._getObject_('3"kdkd\\nre"'),
		prop.object, "Owner");
	a(prop.object.constructor, Base, "Type");
	a(prop, prop.object.$getOwn('figura'), "Prop");

	// Nested Object desriptor prototype
	a.h2("Descriptor prototype");
	a.h3("Ident");
	prop = unserialize('objNewreateTest222/miszka$');
	a.h4("Object");
	a(prop.object.__id__, 'objNewreateTest222/miszka', "Id");
	a(unserialize('objNewreateTest222')._getObject_('miszka'), prop.object,
		"Owner");
	a(prop.object.constructor, Base, "Type");
	a(prop, prop.object._descriptorPrototype_, "Descriptor");
	a(prop.master, unserialize('objNewreateTest222'), "Master");

	a.h3("No ident");
	prop = unserialize('objNewreateTest49349/3"kdkd\\nre"$');
	a.h4("Object");
	a(prop.object.__id__, 'objNewreateTest49349/3"kdkd\\nre"', "Id");
	a(unserialize('objNewreateTest49349')._getObject_('3"kdkd\\nre"'),
		prop.object, "Owner");
	a(prop.object.constructor, Base, "Type");
	a(prop, prop.object._descriptorPrototype_, "Descriptor prototype");

	// Descriptor property
	a.h1("Descriptor property");
	a.h2("Existing");
	obj1.$foo.set('raz', 'dwa');
	prop = obj1.$foo.$raz;
	a(unserialize(prop.__id__), prop);

	a.h2("Not Existing");
	a.h3("Property");
	prop = unserialize(obj1.$foo.__id__ + '/eleo');
	a(prop, obj1.$foo.$eleo);

	a.h3("Object");
	prop = unserialize('objNewreateTest5$elsef/mafa');
	a(prop.object.__id__, 'objNewreateTest5', "Object");
	a(prop._pSKey_, 'elsef', "Property");
	a(prop.object.constructor, ObjectType, "Object type");

	// Descriptor prototype property
	a.h1("Descriptor prototype property");
	a.h2("Existing");
	obj1._descriptorPrototype_.set('raz', 'dwa');
	prop = obj1._descriptorPrototype_.$raz;
	a(unserialize(prop.__id__), prop);

	a.h2("Not Existing");
	a.h3("Property");
	prop = unserialize(obj1._descriptorPrototype_.__id__ + '/eleo');
	a(prop, obj1._descriptorPrototype_.$eleo);

	a.h3("Object");
	prop = unserialize('objNewreateTest787$/mafa');
	a(prop.object.__id__, 'objNewreateTest787', "Object");
	a(prop._pSKey_, '', "Property");
	a(prop.object.constructor, ObjectType, "Object type");

	a.h1("Multiple item");
	a.h2("Existing");
	item = obj1.bar.$getOwn('trzy');
	a(unserialize(item.__id__), item);

	a.h2("Not existing");
	a.h3("Item");
	item = unserialize(obj1.__id__ + '/bar*marko');
	a(item, obj1.bar.$getOwn('marko'));

	a.h3("Object");
	item = unserialize('objNewreateTest6/makara*mafa');
	a(item.__id__, 'objNewreateTest6/makara*mafa', "Item id");
	a(item.object.__id__, 'objNewreateTest6', "Object");
	a(item._pSKey_, 'makara', "Property");

	a.h3("Not ident");
	a.h4("Item");
	item = unserialize(obj1.__id__ + '/24343*2"898.34"');
	a(item, obj1._getMultiple_('24343').$getOwn(898.34));

	a.h4("Object");
	item = unserialize('objNewreateTest63/242343*244898');
	a(item.object.__id__, 'objNewreateTest63', "Object");
	a(item._pSKey_, '242343', "Property");

	a.h1("Descriptor object id");
	a.throws(function () {
		unserialize('blafoo$marko');
	}, "Not existing");

	a.throws(function () {
		unserialize(obj1.$foo.__id__);
	}, "Existing");

	a.h1();
	a(unserialize('29yfwfds2l5/files*70a0h4lijgqp').__id__,
		'29yfwfds2l5/files*70a0h4lijgqp', "Recurrent unserialize");

	a.h1("Named");
	obj1 = unserialize('marko', db.Object.prototype);
	a(obj1.__id__, 'marko', "Id");
	a(obj1 instanceof db.Object, true, "Instance");
	a(obj1, db.marko, "Exposed on database");
};
