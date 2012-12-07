'use strict';

var Base       = require('../../lib/types/base')
  , ObjectType = require('../../lib/types/object')
  , StringType = require('../../lib/types/string')

  , getPrototypeOf = Object.getPrototypeOf;

module.exports = function (t, a) {
	var ns1, obj1, nsc, objc, prop;
	ns1 = ObjectType.create('ObjTests', { foo: StringType,
		 bar: StringType.rel({ multiple: true }) });
	obj1 = ns1({ foo: 'raz', bar: ['dwa', 'trzy'] });

	// CreateObject
	// Constructor
	a(t._createObject('String'), StringType,
		"CreateObject: Constructor: Existing");
	a(t.String, StringType, "Create Object: Constructor: Exposed");
	nsc = t._createObject('ObjCreateTest1');
	a(nsc._id_, 'ObjCreateTest1', "CreateObject: Constructor: Not existing: Id");
	a(getPrototypeOf(nsc), Base,
		"CreateObject: Constructor: Not existing: Prototype");
	a(t[nsc._id_], nsc, "CreateObject: Constructor: Not existing: Exposed");
	nsc = t._createObject('ObjCreateTest2', StringType);
	a(nsc._id_, 'ObjCreateTest2',
		"CreateObject: Constructor: Not existing with proto: Id");
	a(getPrototypeOf(nsc), StringType,
		"CreateObject: Constructor: Not existing with proto: Prototype");
	a(t[nsc._id_], nsc,
		"CreateObject: Constructor: Not existing with proto: Exposed");

	// Object
	a(t._createObject(obj1._id_), obj1, "CreateObject: Object: Existing");
	a(t[obj1._id_], obj1, "CreateObject: Object: Exposed");
	objc = t._createObject('objCreateTest1');
	a(objc._id_, 'objCreateTest1', "CreateObject: Object: Not existing: Id");
	a(objc.ns, ObjectType, "CreateObject: Object: Not existing: Namespace");
	a(t[objc._id_], objc, "CreateObject: Object: Not existing: Exposed");
	objc = t._createObject('objCreateTest2', ns1);
	a(objc._id_, 'objCreateTest2',
		"CreateObject: Object: Not existing with proto: Id");
	a(objc.ns, ns1, "CreateObject: Object: Not existing with proto: Namespace");
	a(t[objc._id_], objc,
		"CreateObject: Object: Not existing with proto: Exposed");

	// Create
	// Constructor
	a(t._create('String'), StringType, "Create: Constructor: Existing");
	nsc = t._create('ObjCreateTest3');
	a(nsc._id_, 'ObjCreateTest3', "Create: Constructor: Not existing: Id");
	a(getPrototypeOf(nsc), Base, "Create: Constructor: Not existing: Prototype");
	a(t[nsc._id_], nsc, "Create: Constructor: Not existing: Exposed");

	// Object
	a(t._create(obj1._id_), obj1, "Create: Object: Existing");
	objc = t._create('objCreateTest3');
	a(objc._id_, 'objCreateTest3', "Create: Object: Not existing: Id");
	a(objc.ns, ObjectType, "Create: Object: Not existing: Namespace");
	a(t[objc._id_], objc, "Create: Object: Not existing: Exposed");

	// Object:prop
	a(t._create(obj1._foo._id_), obj1._foo, "Create: Object: Prop: Existing");
	a(t[obj1._foo._id_], obj1._foo, "Create: Object: Prop: Existing: Exposed");
	prop = t._create(obj1._id_ + ':' + 'other');
	a(prop, obj1._other, "Create: Object: Prop: Not Existing");
	a(t[prop._id_], prop, "Create: Object: Prop: Not Existing: Exposed");

	prop = t._create('objCreateTest4:' + 'elok');
	a(prop.obj._id_, 'objCreateTest4',
		"Create: Object: Prop: Not existing obj: Id");
	a(prop.obj.ns, ObjectType,
		"Create: Object: Prop: Not existing obj: Namespace");
	a(t[prop.obj._id_], prop.obj,
		"Create: Object: Prop: Not existing obj: Exposed");
	a(prop, prop.obj._elok, "Create: Object: Prop: Not Existing obj");
	a(t[prop._id_], prop, "Create: Object: Prop: Not Existing obj: Exposed");

	// Object:prop:prop
	obj1._foo.set('raz', 'dwa');
	prop = obj1._foo._raz;
	a(t._create(prop._id_), prop, "Create: Object: Prop: Prop: Existing");
	a(t[prop._id_], prop, "Create: Object: Prop: Prop: Existing: Exposed");

	prop = t._create(obj1._foo._id_ + ':' + 'eleo');
	a(prop, obj1._foo._eleo, "Create: Object: Prop: Prop: Not Existing");
	a(t[prop._id_], prop, "Create: Object: Prop: Prop: Not Existing: Exposed");

	prop = t._create('objCreateTest5:elsef:mafa');
	a(prop.obj._id_, 'objCreateTest5:elsef',
		"Create: Object: Prop: Prop: Not existing obj: Prop Id");
	a(prop.obj.obj._id_, 'objCreateTest5',
		"Create: Object: Prop: Prop: Not existing obj: Id");
	a(prop.obj.obj.ns, ObjectType,
		"Create: Object: Prop: Prop: Not existing obj: Namespace");
	a(t[prop.obj.obj._id_], prop.obj.obj,
		"Create: Object: Prop: Prop: Not existing obj: Exposed");
	a(prop, prop.obj.obj._elsef._mafa,
		"Create: Object: Prop: Prop: Not Existing obj");
	a(t[prop._id_], prop,
		"Create: Object: Prop: Prop: Not Existing obj: Exposed");

	// Object:prop:item
	prop = obj1._bar['3trzy'];
	a(t._create(prop._id_), prop, "Create: Object: Prop: Item: Existing");
	a(t[prop._id_], prop, "Create: Object: Prop: Item: Existing: Exposed");

	prop = t._create(obj1._bar._id_ + ':3marko"');
	a(prop, obj1._bar['3marko'], "Create: Object: Prop: Item: Not Existing");
	a(t[prop._id_], prop, "Create: Object: Prop: Item: Not Existing: Exposed");

	prop = t._create('objCreateTest6:makara:3mafa"');
	a(prop.obj._id_, 'objCreateTest6:makara',
		"Create: Object: Prop: Item: Not existing obj: Prop Id");
	a(prop.obj.obj._id_, 'objCreateTest6',
		"Create: Object: Prop: Item: Not existing obj: Id");
	a(prop.obj.obj.ns, ObjectType,
		"Create: Object: Prop: Item: Not existing obj: Namespace");
	a(t[prop.obj.obj._id_], prop.obj.obj,
		"Create: Object: Prop: Item: Not existing obj: Exposed");
	a(prop, prop.obj.obj._makara['3mafa'],
		"Create: Object: Prop: Item: Not Existing obj");
	a(t[prop._id_], prop,
		"Create: Object: Prop: Item: Not Existing obj: Exposed");

	// Object:prop:item:prop
	obj1._bar['3dwa'].set('cztery', 'pięć');
	prop = obj1._bar['3trzy']._cztery;
	a(t._create(prop._id_), prop, "Create: Object: Prop: Item: Prop: Existing");
	a(t[prop._id_], prop, "Create: Object: Prop: Item: Prop: Existing: Exposed");

	prop = t._create(obj1._bar['3dwa']._id_ + ':helga');
	a(prop, obj1._bar['3dwa']._helga,
		"Create: Object: Prop: Item: Prop: Not Existing");
	a(t[prop._id_], prop,
		"Create: Object: Prop: Item: Prop: Not Existing: Exposed");

	prop = t._create('objCreateTest7:misko:3maersl":hahah');
	a(prop.obj._id_, 'objCreateTest7:misko:3maersl"',
		"Create: Object: Prop: Item: Prop: Not existing obj: Item  Id");
	a(prop.obj.obj._id_, 'objCreateTest7:misko',
		"Create: Object: Prop: Item: Prop: Not existing obj: Prop Id");
	a(prop.obj.obj.obj._id_, 'objCreateTest7',
		"Create: Object: Prop: Item: Prop: Not existing obj: Id");
	a(prop.obj.obj.obj.ns, ObjectType,
		"Create: Object: Prop: Item: Prop: Not existing obj: Namespace");
	a(t[prop.obj.obj.obj._id_], prop.obj.obj.obj,
		"Create: Object: Prop: Item: Prop: Not existing obj: Exposed: obj");
	a(prop, prop.obj.obj.obj._misko['3maersl']._hahah,
		"Create: Object: Prop: Item: Prop: Not Existing obj");
	a(t[prop._id_], prop,
		"Create: Object: Prop: Item: Prop: Not Existing obj: Exposed");
};
