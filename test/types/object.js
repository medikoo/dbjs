'use strict';

var isError = require('es5-ext/lib/Error/is-error')
  , keys    = Object.keys;

require('../../lib/types/boolean');
require('../../lib/types/string');

module.exports = function (t) {
	return {
		"Constructor": function (a) {
			var ns, obj, strNs, pObj;
			strNs = t.String.create('ZipCode', {
				pattern: /^\d{2}-\d{3}$/
			});
			ns = t.create('Otest1', { foo: t.String, bar: t.Boolean, raz: strNs });
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
				ns(obj._id_);
			}, "Object id");

			pObj = t({ foo: 'elo' });
			obj = ns(pObj);
			a.not(obj, pObj, "Object from other namespace #1");
			a.deep(obj, { foo: 'elo' }, "Object from other namespace #2");
			a.throws(function () {
				ns(pObj._id_);
			}, "Object Id from other namespace");

			ns = t.create('Otest2', function (value) { this.set('foo', value); },
				 { foo: t.String  }, { verify: function () {} });

			obj = ns('whatever');
			a(obj.foo, 'whatever', "Custom construct");
		},
		"NewNamed": function (a) {
			var obj = t.newNamed('namedobjtest', { foo: 'raz', bar: 12 });
			a.deep(obj, { foo: 'raz', bar: 12 }, "Content");
			a(typeof obj, 'object', "Type");
			a(obj.ns, t, "Namespace");
			a(obj._id_, 'namedobjtest', "Id");
			a(t[obj._id_], obj, "Exposed on namespace");
			a.throws(function () {
				t.newNamed('raz dwa#');
			}, "Name validation");
		},
		"Is": function (a) {
			var ns, obj, props, obj2;
			ns = t.create('OtestIs', { foo: t.String, bar: t.Boolean });
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
		"Create": function (a) {
			var ns, date = new Date();
			ns = t.create('Otest3', { foo: t.String, bar: t.Boolean },
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

			a(ns.validate(), null, "Undefined");
			a(ns.validate(obj), null, "Created object");
			a(ns.validate({}), null, "Data for object");
			a(isError(ns.validate(obj._id_)), true, "Object id");
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
		}
	};
};
