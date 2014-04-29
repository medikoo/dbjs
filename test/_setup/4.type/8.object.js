'use strict';

var toArray  = require('es5-ext/array/to-array')
  , Database = require('../../../')

  , keys = Object.keys, getPrototypeOf = Object.getPrototypeOf;

module.exports = function (a) {
	var db = new Database(), Type = db.Object;

	return {
		"Constructor": function (a) {
			var CustomType, obj, ZipCode;
			ZipCode = db.String.extend('ZipCode',
				{ pattern: { value: /^\d{2}-\d{3}$/ } });
			CustomType = Type.extend('Otest1', { foo: { type: db.String },
				bar: { type: db.Boolean }, raz: { type: ZipCode } });
			obj = CustomType({ foo: 12, bar: {}, other: null, other2: 'razdwa' });

			a.deep(keys(obj).sort(), ['bar', 'foo', 'other', 'other2'],
				"Object keys");

			a(obj.foo, '12', "Schema #1");
			a(obj.bar, true, "Schema #2");
			a(obj.raz, undefined, "Schema #3");
			a(obj.other, null, "No schema #1");
			a(obj.other2, 'razdwa', "No schema #2");

			a.throws(function () { obj.raz = 'wrong value'; }, 'INVALID_STRING',
				"Invalid assign");

			obj.raz = '00-763';
			a(obj.raz, '00-763', "Valid assign");

			a.throws(function () { CustomType({ raz: '23423' }); },
				'SET_PROPERTIES_ERROR', "Invalid create");

			a(typeof CustomType().__id__, 'string', "Undefined data");

			a(CustomType(obj), obj, "Created object");

			CustomType = Type.extend('Otest2',
				function (value) { this._set_('foo', value); },
				{ foo: { type: db.String } },
				{ _validateCreate_: { value: function (value) {
					return [this._validateSet_('foo', value)];
				} } });

			obj = CustomType('whatever');
			a(obj.foo, 'whatever', "Custom construct");
		},
		"NewNamed": function (a) {
			var CustomType, obj;
			CustomType = Type.extend('NamedTest', {
				foo: { type: db.String },
				bar: { type: db.Number, multiple: true }
			});
			obj = CustomType.newNamed('namedobjtest', { foo: 'raz', bar: [12, 18] });
			a.deep(obj, { foo: 'raz', bar: obj.bar }, "Content");
			a(typeof obj, 'object', "Type");
			a(obj.constructor, CustomType, "Namespace");
			a(obj.__id__, 'namedobjtest', "Id");
			a(db.namedobjtest, obj, "Exposed on database");
			a.throws(function () {
				CustomType.newNamed('raz dwa#');
			}, 'INVALID_OBJECT_NAME', "Name validation");
		},
		"Is": function (a) {
			var CustomType, obj, props, obj2;
			CustomType = Type.extend('OtestIs', { foo: { type: db.String },
				bar: { type: db.Boolean } });
			obj = CustomType(props = { foo: 'raz', bar: true });
			obj2 = Type({ foo: 'else' });
			a(CustomType.is(), false, "Undefined");
			a(CustomType.is(null), false, "Null");
			a(CustomType.is(props), false, "Plain Object");
			a(CustomType.is(new Date()), false, "Date");
			a(CustomType.is(true), false, "Boolean");
			a(CustomType.is(obj.__id__), false, "Object ID");
			a(CustomType.is(obj), true, "Object from namespace");
			a(Type.is(obj), true, "Object from descending namespace");
			a(CustomType.is(obj2), false, "Object from ascending namespace");
			a(Type.is(obj2), true, "Object on ascending namespace");
		},
		"Extend": function (a) {
			var CustomType, date = new Date();
			CustomType = Type.extend('Otest3', { foo: { type: db.String },
				bar: { type: db.Boolean } },
				{ raz: { value: 15 }, dwa: { value: date } });
			a.deep(keys(CustomType.prototype).sort(), [], "Defined on prototype");
			CustomType.prototype.foo = 23;
			CustomType.prototype.bar = {};
			a.deep(keys(CustomType.prototype).sort(), ['bar', 'foo'],
				"Set on prototype");
			a.deep([CustomType.prototype.foo, CustomType.prototype.bar], ['23', true],
				"Set on prototype: Values");
			a(CustomType.raz, 15, "Self property #1");
			a(CustomType.dwa, date, "Self property #2");
		},
		"Validate": function (a) {
			var CustomType, obj;
			CustomType = Type.extend('Otest4');
			obj = CustomType({});

			a.throws(function () { CustomType.validate(); }, 'INVALID_OBJECT_TYPE',
				"Undefined");
			a(CustomType.validate(obj), obj, "Created object");
			a.throws(function () { CustomType.validate({}); }, 'INVALID_OBJECT_TYPE',
				"Foreign object");
		},
		"Normalize": function (a) {
			var CustomType, obj, pObj;
			CustomType = Type.extend('Otest5');
			obj = CustomType({});

			a(CustomType.normalize(null), null, "Null");
			a(CustomType.normalize(), null, "Undefined");
			a(CustomType.normalize(obj), obj, "Created object");
			a(CustomType.normalize(obj.__id__), null, "Object id");

			pObj = Type({});
			a(CustomType.normalize(pObj), null, "Object from other namespace");
			a(CustomType.normalize(pObj.__id__), null,
				"Object Id from other namespace");
			a(CustomType.normalize('asdfafa'), null, "Unrecognized string");
			a(CustomType.normalize(33453), null, "Not an object");
			a(CustomType.normalize({}), null, "Foreign object");
		},
		"Proto change": function (a) {
			var CustomType1 = Type.extend('ProtoObjectTest1')
			  , CustomType2 = Type.extend('ProtoObjectTest2')
			  , obj = CustomType1({ foo: 'bar' });

			obj._setValue_(CustomType2.prototype);
			a(getPrototypeOf(obj), CustomType2.prototype, "Prototype");

			obj._setValue_();
			a(getPrototypeOf(obj), db.Base.prototype, "Removed: Prototype");
		},
		"Filter by property": function (a) {
			var db = new Database(), obj1, obj2, obj3, set;

			obj1 = new db.Object({ foo: 'awa' });
			obj2 = new db.Object({ foo: 'bwa' });

			a.deep(toArray(db.Object.instances), [obj1, obj2], "Instances");
			set = db.Object.filterByKey('foo', 'bwa');
			a.deep(toArray(set), [obj2], "Initial");

			obj3 = new db.Object({ foo: 'bwa' });

			a.deep(toArray(set), [obj2, obj3], "Create");

			obj1.foo = 'bwa';
			a.deep(toArray(set), [obj1, obj2, obj3], "Update: add");

			obj2.foo = 'bwdfd';
			a.deep(toArray(set), [obj1, obj3], "Update: remove");

			obj2.foo = 'bwa';
			a.deep(toArray(set), [obj1, obj2, obj3], "Update same property twice");
		},
		"Get by Id": function (a) {
			var db = new Database(), Type = db.Object.extend('ObjectType')
			  , obj1, obj2;

			obj1 = new db.Object();
			obj2 = new Type();

			a(db.Object.getById(obj1.__id__), obj1, "Direct instance");
			a(db.Object.getById(obj2.__id__), obj2, "Extension instance");
			a(Type.getById(obj1.__id__), null, "Not found");
			a(Type.getById(obj2.__id__), obj2, "Extension search");
		}
	};
};
