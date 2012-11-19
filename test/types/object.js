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
		"Create": function (a) {
			var ns, fn = function () {};
			ns = t.create('otest3', { foo: t.string, bar: t.boolean },
				 { raz: 15, dwa: fn });
			a.deep(keys(ns.prototype).sort(), ['bar', 'foo'], "Set on prototype");
			a(ns.raz, 15, "Self property #1");
			a(ns.dwa, fn, "Self property #2");
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
		},
		"DB exposed": function (a) {
			a(t().db, t);
		}
	};
};
