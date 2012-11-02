'use strict';

var d      = require('es5-ext/lib/Object/descriptor')
  , object = require('../lib/object')

  , defineProperties = Object.defineProperties, keys = Object.keys;

module.exports = function (t) {
	return {
		"": function (a) {
			var obj = {};
			a(t('raz'), 'raz', "Default: String");
			a(t(obj), obj, "Default: Object");
		},
		"Create": {
			"Name": function (a) {
				a.throws(function () {
					t.create('0sdfs');
				}, "Digit first");
				a.throws(function () {
					t.create('raz dwa');
				}, "Inner space");
				a.throws(function () {
					t.create('_foo');
				}, "Underscore");
			},
			"Constructor": function (a) {
				var ns;
				a(t('foo'), 'foo', "Default");
				a(t.create('test11')('bar'), 'bar', "Clone when not provided");
				ns = t.create('test12', function (value) { return 'lorem' + value; });
				a(ns('ipsum'), 'loremipsum', "Provided");
			},
			"Properties": function (a) {
				var props, date = new Date(), fn = function () {}, re = /raz/
				  , stro = new String('raz'), numo = new Number(12)
				  , boolo = new Boolean(true), obj = t.object({ foo: 'bar' })
				  , ns1, ns2;

				props = defineProperties({}, {
					obj: d('e', obj),
					sch: d('e', t.string),
					dt: d('e', date),
					fn: d('e', fn),
					re: d('e', re),
					stro: d('e', stro),
					numo: d('e', numo),
					boolo: d('e', boolo),
					str: d('e', 'bar'),
					num: d('e', 123),
					bool: d('e', false),
					other: d('e', { toString: function () { return 'medi'; } }),
					na: d({})
				});

				ns1 = t.create('test21', function (value) { return 'foo' + value; },
					props);
				a.deep(keys(ns1), [], "Not enumerable");
				a(ns1.obj, obj, "Object: Value");
				a(ns1._obj.value, obj, "Object: Relation: Value");
				a(ns1._obj.ns, t.object, "Object: Relation: Namespace");
				a(ns1.sch, t.string, "Schema: Value");
				a(ns1._sch.value, t.string, "Schema: Relation: Value");
				a(ns1._sch.ns, t.schema, "Schema: Relation: Namespace");
				a(ns1.dt, date, "DateTime: Value");
				a(ns1._dt.ns, t.dateTime, "DateTime: Relation: Namespace");
				a(ns1.fn, fn, "Function: Value");
				a(ns1._fn.ns, t.function, "Function: Relation: Namespace");
				a(ns1.re, re, "RegExp: Value");
				a(ns1._re.ns, t.regExp, "RegExp: Relation: Namespace");
				a(ns1.stro, 'raz', "String object: Value");
				a(ns1._stro.ns, t.string, "String object: Relation: Namespace");
				a(ns1.numo, 12, "Number object: Value");
				a(ns1._numo.ns, t.number, "Number object: Relation: Namespace");
				a(ns1.boolo, true, "Boolean object: Value");
				a(ns1._boolo.ns, t.boolean, "Boolean object: Relation: Namespace");
				a(ns1.str, 'bar', "String: Value");
				a(ns1._str.ns, t.string, "String: Relation: Namespace");
				a(ns1.num, 123, "Number: Value");
				a(ns1._num.ns, t.number, "Number: Relation: Namespace");
				a(ns1.bool, false, "Boolean: Value");
				a(ns1._bool.ns, t.boolean, "Boolean: Relation: Namespace");
				a(ns1.other, 'medi', "Other: Value");
				a(ns1._other.ns, t.string, "Other: Relation: Namespace");
				a(ns1.na, undefined, "Hidden");
				a(ns1.hasOwnProperty('na'), false, "Hidden: Not defined");

				ns2 = t.create('test22', props);
				a(ns2.fn, fn, "No constructor");

				a.throws(function () {
					t.create('test23', { _foo: 'whatever' });
				}, "Bad property name");

			},
			"Meta": function (a) {
				var ns = t.create('test3');
				a(t.test3, ns, "Set on base");
				a(ns.__id, 'test3', "Id");
				a((ns.__created / 1000) <= (Date.now() + 1), true, "Created");
			}
		},
		"Transaction": function (a) {
			var obj1, obj2;
			t.transaction(function () {
				obj1 = object({ foo: 'bar' });
				obj2 = object({ raz: 2 });
			});
			a(obj1.__created, obj2.__created, "Time lock");
			a.not(obj1.__id, obj2.__id, "Id");
			try {
				t.transaction(function () {
					obj1 = object({ foo: 'bar' });
					throw new Error('Error');
				});
			} catch (e) {}
			a.not(obj1.__created, obj2.__created, "Time lock #2");
			obj2 = object({ raz: 3 });
			a.not(obj1.__created, obj2.__created, "Time lock #3");
		},
		"Validate": function (a) {
			var obj = {};
			a(t.validate('raz'), 'raz', "String");
			a(t.validate(obj), obj, "Object");
		},
		"Normalize": function (a) {
			var obj = {};
			a(t.normalize('raz'), 'raz', "String");
			a(t.normalize(obj), obj, "Object");
		},
		"Serialize": function (a) {
			a(t.serialize('raz'), 'raz', "String");
			a(t.serialize(null), null, "Null");
			a(t.serialize(new Date(Date.UTC(2012, 0, 1, 0, 0, 0))),
				'2012-01-01T00:00:00.000Z', "Date");
			a(t.serialize(function () { return 'foo'; }),
				'function () { return \'foo\'; }', "Function");
			a(t.serialize(/foo/), '/foo/', "RegExp");
			a(t.serialize(13), 13, "Number");
			a(t.serialize(true), true, "Boolean");
		}
	};
};
