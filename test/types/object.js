'use strict';

var isError = require('es5-ext/lib/Error/is-error')
  , keys    = Object.keys;

require('../../lib/types/boolean');
require('../../lib/types/string');

module.exports = function (t) {
	return {
		"Constructor": function (a) {
			var ns, obj, strNs, pObj;
			strNs = t.string.create('zipCode', {
				pattern: /^\d{2}-\d{3}$/
			});
			ns = t.create('otest1', { foo: t.string, bar: t.boolean, raz: strNs });
			obj = ns({ foo: 12, bar: {}, other: null, other2: 'razdwa' });
			a.deep(keys(obj).sort(), ['bar', 'foo', 'other', 'other2'],
				"Object keys");

			a(ns[obj.__id], obj, "Assigned to namespace");
			a.deep(keys(ns), [obj.__id], "Enumerable on namespace");
			a(t.propertyIsEnumerable(obj.__id), true,
				"Enumerable on ancestor namespace");
			a(t[obj.__id], obj, "Assigned to ancestor namespace");

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

			a(typeof ns().__id, 'string', "Undefined data");

			a(ns(obj), obj, "Created object");
			a.throws(function () {
				ns(obj.__id);
			}, "Object id");

			pObj = t({ foo: 'elo' });
			obj = ns(pObj);
			a.not(obj, pObj, "Object from other namespace #1");
			a.deep(obj, { foo: 'elo' }, "Object from other namespace #2");
			a.throws(function () {
				ns(pObj.__id);
			}, "Object Id from other namespace");

			ns = t.create('otest2', function (value) { this.set('foo', value); },
				 { foo: t.string  }, { verify: function () {} });

			obj = ns('whatever');
			a(obj.foo, 'whatever', "Custom construct");
		},
		"NewNamed": function (a) {
			var obj = t.newNamed('namedobjtest', { foo: 'raz', bar: 12 });
			a.deep(obj, { foo: 'raz', bar: 12 }, "Content");
			a(typeof obj, 'object', "Type");
			a(obj.ns, t, "Namespace");
			a(obj.__id, 'namedobjtest', "Id");
			a(t[obj.__id], obj, "Exposed on namespace");
			a.throws(function () {
				t.newNamed('raz dwa#');
			}, "Name validation");
		},
		"Is": function (a) {
			var ns, obj, props, obj2;
			ns = t.create('otestIs', { foo: t.string, bar: t.boolean });
			obj = ns(props = { foo: 'raz', bar: true });
			obj2 = t({ foo: 'else' });
			a(ns.is(), false, "Undefined");
			a(ns.is(null), false, "Null");
			a(ns.is(props), false, "Plain Object");
			a(ns.is(new Date()), false, "Date");
			a(ns.is(true), false, "Boolean");
			a(ns.is(obj.__id), false, "Object ID");
			a(ns.is(obj), true, "Object from namespace");
			a(t.is(obj), true, "Object from descending namespace");
			a(ns.is(obj2), false, "Object from ascending namespace");
			a(t.is(obj2), true, "Object on ascending namespace");
		},
		"Create": function (a) {
			var ns, date = new Date();
			ns = t.create('otest3', { foo: t.string, bar: t.boolean },
				 { raz: 15, dwa: date });
			a.deep(keys(ns.prototype).sort(), ['bar', 'foo'], "Set on prototype");
			a(ns.raz, 15, "Self property #1");
			a(ns.dwa, date, "Self property #2");
		},
		"Validate": function (a) {
			var ns, obj;
			ns = t.create('otest4');
			obj = ns({});

			a(ns.validate(), undefined, "Undefined");
			a(ns.validate(obj), undefined, "Created object");
			a(ns.validate({}), undefined, "Data for object");
			a(isError(ns.validate(obj.__id)), true, "Object id");
		},
		"Normalize": function (a) {
			var ns, obj, pObj;
			ns = t.create('otest5');
			obj = ns({});

			a(ns.normalize(null), null, "Null");
			a(ns.normalize(), null, "Undefined");
			a(ns.normalize(obj), obj, "Created object");
			a(ns.normalize(obj.__id), null, "Object id");

			pObj = t({});
			a(ns.normalize(pObj), null, "Object from other namespace");
			a(ns.normalize(pObj.__id), null, "Object Id from other namespace");
			a(ns.normalize('asdfafa'), null, "Unrecognized string");
			a(ns.normalize(33453), null, "Not an object");
			a(ns.normalize({}), null, "Other object");
		}
	};
};
