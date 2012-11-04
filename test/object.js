'use strict';

var keys = Object.keys;

module.exports = function (t) {
	return {
		"Constructor": function (a) {
			var ns, obj, strNs, pObj;
			strNs = t.string.create('zipCode', {
				validate: function (value) {
					if (value == null) return null;
					if (!/^\d{2}-\d{3}$/.test(value)) {
						throw new TypeError(value + " is not a valid strNs");
					}
					return String(value);
				}
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

			a.throws(function () { ns(); }, "Undefined");
			a(ns(obj), obj, "Created object");
			a(ns(obj.__id), obj, "Object id");

			pObj = t({});
			a.throws(function () {
				ns(pObj);
			}, "Object from other namespace");
			a.throws(function () {
				ns(pObj.__id);
			}, "Object Id from other namespace");
			a.throws(function () {
				ns('asdfafa');
			}, "Unrecognized string");
			a.throws(function () {
				ns(33453);
			}, "Not an object");
		},
		"Create": function (a) {
			var ns;
			ns = t.create('otest2', { foo: t.string, bar: t.boolean });
			a.deep(keys(ns.prototype).sort(), ['bar', 'foo'], "Set on prototype");
		},
		"Validate": function (a) {
			var ns, obj, pObj;
			ns = t.create('otest3');
			obj = ns({});

			a.throws(function () { ns.validated(); }, "Undefined");
			a(ns.validate(obj), obj, "Created object");
			a.throws(function () {
				ns.validate(obj.__id);
			}, "Object id");

			pObj = t({});
			a.throws(function () {
				ns.validate(pObj);
			}, "Object from other namespace");
			a.throws(function () {
				ns.validate(pObj.__id);
			}, "Object Id from other namespace");
			a.throws(function () {
				ns.validate('asdfafa');
			}, "Unrecognized string");
			a.throws(function () {
				ns.validate(33453);
			}, "Not an object");
			a.throws(function () {
				ns.validate({});
			}, "Other object");
		},
		"Normalize": function (a) {
			var ns, obj, pObj;
			ns = t.create('otest4');
			obj = ns({});

			a(ns.normalize(null), null, "Null");
			a(ns.normalize(), null, "Undefined");
			a(ns.normalize(obj), obj, "Created object");
			a(ns.normalize(obj.__id), obj, "Object id");

			pObj = t({});
			a(ns.normalize(pObj), null, "Object from other namespace");
			a(ns.normalize(pObj.__id), null, "Object Id from other namespace");
			a(ns.normalize('asdfafa'), null, "Unrecognized string");
			a(ns.normalize(33453), null, "Not an object");
			a(ns.normalize({}), null, "Other object");
		}
	};
};
