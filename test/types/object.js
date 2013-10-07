'use strict';

var isError   = require('es5-ext/error/is-error')
  , Db        = require('../../')
  , serialize = require('../../lib/utils/serialize')

  , BooleanType = Db.Boolean, StringType = Db.String
  , keys = Object.keys, getPrototypeOf = Object.getPrototypeOf
  , byId = function (a, b) { return a._id_.localeCompare(b._id_); };

module.exports = function (t) {
	return {
		"Constructor": function (a) {
			var ns, obj, strNs, pObj;
			strNs = StringType.create('ZipCode', {
				pattern: /^\d{2}-\d{3}$/
			});
			ns = t.create('Otest1',
				{ foo: StringType, bar: BooleanType, raz: strNs });
			obj = ns({ foo: 12, bar: {}, other: null, other2: 'razdwa' });
			a.deep(keys(obj).sort(), ['bar', 'foo', 'other', 'other2'],
				"Object keys");

			a(ns[obj._id_], obj, "Assigned to namespace");
			a.deep(keys(ns), [obj._id_], "Enumerable on namespace");
			a(t.propertyIsEnumerable(obj._id_), true,
				"Enumerable on ancestor namespace");
			a(t[obj._id_], obj, "Assigned to ancestor namespace");

			a(obj.foo, '12', "Schema #1");
			a(obj.bar, true, "Schema #2");
			a(obj.raz, undefined, "Schema #3");
			a(obj.other, null, "No schema #1");
			a(obj.other2, 'razdwa', "No schema #2");

			a.throws(function () {
				obj.raz = 'wrong value';
			}, "Invalid assign");

			obj.raz = '00-763';
			a(obj.raz, '00-763', "Valid assign");

			a.throws(function () {
				ns({ raz: '23423' });
			}, "Invalid create");

			a(typeof ns()._id_, 'string', "Undefined data");

			a(ns(obj), obj, "Created object");
			a.throws(function () {
				ns({ 0: '0', 1: 'd', 2: '4' });
			}, "Object id");

			pObj = t({ foo: 'elo' });
			a.throws(function () { ns(pObj); }, "Object from other namespace #1");

			ns = t.create('Otest2', function (value) { this.set('foo', value); }, {
				foo: StringType,
				validateConstruction: function (value) {
					return this.validateCreateProperty('foo', value);
				}
			});

			obj = ns('whatever');
			a(obj.foo, 'whatever', "Custom construct");
		},
		"NewNamed": function (a) {
			var Ns, obj;
			Ns = t.create('NamedTest', {
				foo: Db.String,
				bar: Db.Number.rel({ multiple: true })
			});
			obj = Ns.newNamed('namedobjtest', { foo: 'raz', bar: [12, 18] });
			a.deep(obj, { foo: 'raz', bar: obj.bar }, "Content");
			a(typeof obj, 'object', "Type");
			a(obj.ns, Ns, "Namespace");
			a(obj._id_, 'namedobjtest', "Id");
			a(t[obj._id_], obj, "Exposed on namespace");
			a.throws(function () {
				t.newNamed('raz dwa#');
			}, "Name validation");
		},
		"Is": function (a) {
			var ns, obj, props, obj2;
			ns = t.create('OtestIs', { foo: StringType, bar: BooleanType });
			obj = ns(props = { foo: 'raz', bar: true });
			obj2 = t({ foo: 'else' });
			a(ns.is(), false, "Undefined");
			a(ns.is(null), false, "Null");
			a(ns.is(props), false, "Plain Object");
			a(ns.is(new Date()), false, "Date");
			a(ns.is(true), false, "Boolean");
			a(ns.is(obj._id_), false, "Object ID");
			a(ns.is(obj), true, "Object from namespace");
			a(t.is(obj), true, "Object from descending namespace");
			a(ns.is(obj2), false, "Object from ascending namespace");
			a(t.is(obj2), true, "Object on ascending namespace");
		},
		"Set": function (a) {
			var ns = t.create('OSetTest1'), obj1, obj2, args = [], objs, x = {};
			obj1 = ns();
			obj2 = ns();
			objs = [obj1, obj2].sort(byId);
			a(ns._isSet_, true, "Is");
			a.deep(ns.values.sort(byId), objs, "Values");
			ns.forEach(function () { args.push(arguments); }, x);
			args.sort(function (a, b) { return a[0]._id_.localeCompare(b[0]._id_); });
			a.deep(args[0], [objs[0], objs[0]._id_, ns, args[0][3]], "ForEach #1");
			a.deep(args[1], [objs[1], objs[1]._id_, ns, args[1][3]], "ForEach #2");
		},
		"Create": function (a) {
			var ns, date = new Date();
			ns = t.create('Otest3', { foo: StringType, bar: BooleanType },
				{ raz: 15, dwa: date });
			a.deep(keys(ns.prototype).sort(), [], "Defined on prototype");
			ns.prototype.foo = 23;
			ns.prototype.bar = {};
			a.deep(keys(ns.prototype).sort(), ['bar', 'foo'], "Set on prototype");
			a.deep([ns.prototype.foo, ns.prototype.bar], ['23', true],
				"Set on prototype: Values");
			a(ns.raz, 15, "Self property #1");
			a(ns.dwa, date, "Self property #2");
		},
		"Validate": function (a) {
			var ns, obj;
			ns = t.create('Otest4');
			obj = ns({});

			a(ns.prototype.validateCreate(), null, "Undefined");
			a(ns.prototype.validateCreate(obj), null, "Created object");
			a(ns.prototype.validateCreate({}), null, "Data for object");
			a(isError(ns.prototype.validateCreate({ 0: '0', 1: 'd', 2: '4' })),
				true, "Object id");
		},
		"Normalize": function (a) {
			var ns, obj, pObj;
			ns = t.create('Otest5');
			obj = ns({});

			a(ns.normalize(null), null, "Null");
			a(ns.normalize(), null, "Undefined");
			a(ns.normalize(obj), obj, "Created object");
			a(ns.normalize(obj._id_), null, "Object id");

			pObj = t({});
			a(ns.normalize(pObj), null, "Object from other namespace");
			a(ns.normalize(pObj._id_), null, "Object Id from other namespace");
			a(ns.normalize('asdfafa'), null, "Unrecognized string");
			a(ns.normalize(33453), null, "Not an object");
			a(ns.normalize({}), null, "Other object");
		},
		"Proto change": function (a) {
			var ns1 = t.create('ProtoObjectTest1')
			  , ns2 = t.create('ProtoObjectTest2')
			  , obj = ns1({ foo: 'bar' });

			obj.$$setValue(ns2.prototype);
			a(getPrototypeOf(obj), ns2.prototype, "Prototype");
			a(ns1.hasOwnProperty(obj._id_), false, "Visible: Old");
			a(ns2.hasOwnProperty(obj._id_), true, "Visible: New");
			a(t.hasOwnProperty(obj._id_), true, "Visible: Base");

			obj.$$setValue();
			a(getPrototypeOf(obj), Db.Base.prototype, "Removed: Prototype");
			a(ns2.hasOwnProperty(obj._id_), false, "Removed: Visible: Ns");
			a(t.hasOwnProperty(obj._id_), false, "Removed: Visible: Base");
		},
		"Serialize": function (a) {
			var obj = new Db();
			a(t._serialize_(obj), serialize(obj));
		}
	};
};
