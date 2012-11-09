'use strict';

var isFunction = require('es5-ext/lib/Function/is-function')
  , deferred   = require('deferred/lib/deferred')
  , isPromise  = require('deferred/lib/is-promise')
  , nextTick   = require('next-tick')
  , object     = require('../lib/object');

module.exports = function (t) {
	var ns = t.create('simpletest', {
		validate: function (value) { return value; },
		normalize: function (value) { return value; }
	});

	return {
		"Create": {
			"Name": function (a) {
				a.throws(function () {
					ns.create('0sdfs');
				}, "Digit first");
				a.throws(function () {
					ns.create('raz dwa');
				}, "Inner space");
				a.throws(function () {
					ns.create('_foo');
				}, "Underscore");
				ns.create('test0');
			},
			"Constructor": function (a) {
				var ns2;
				a(ns('bar'), 'bar', "Clone when not provided");
				ns2 = ns.create('test12', function (value) { return 'lorem' + value; });
				a(ns2('ipsum'), 'loremipsum', "Provided");
			},
			"Properties": function (a) {
				var ns1, x = {}, y = {};

				a.throws(function () { t.create('test21', {}); },
					"Need to provide normalize and validate");

				ns1 = t.create('test22', {
					normalize: function (value) { return value; },
					validate: function (value) { return value; },
					other: x,
					other2: 13
				});

				a(ns1(y), y, "Constructor");
				a(ns1.other, x, "Not namespaced property: Object");
				a(ns1.other2, 13, "Not namespaced property: Primitive");

				a.throws(function () {
					t.create('test23', {
						normalize: function (value) { return value; },
						validate: function (value) { return value; },
						_foo: 'whatever'
					});
				}, "Bad property name");
			},
			"Meta": function (a) {
				var ns = t.create('test3', {
					normalize: function (value) { return value; },
					validate: function (value) { return value; }
				});
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
		},
		"Rel": function (a) {
			var ext = object.create('reltest1', {
				foo: ns.rel({ required: true }),
				bar: ns.rel({ required: true, default: 45 })
			});
			a(ext.prototype.foo, undefined, "Value");
			a(ext.prototype._$foo.ns, ns, "Namespace");
			a(ext.prototype._$foo.required, true, "Required");

			a(ext.prototype.bar, 45, "Value #2");
			a(ext.prototype._$bar.ns, ns, "Namespace #2");
			a(ext.prototype._$bar.required, true, "Required #2");
		},
		"Required": function (a) {
			var ext = object.create('reltest3', {
				foo: ns.required
			});
			a(ext.prototype.foo, undefined, "Value");
			a(ext.prototype._$foo.ns, ns, "Namespace");
			a(ext.prototype._$foo.required, true, "Required");
		},
		"Async": function (a, d) {
			var ns1, ns2, ns3, invoked;
			ns1 = t.string.create('asynctest1', {
				async: true,
				validate: function (value) {
					var def = deferred();
					nextTick(function () {
						def.resolve(value);
					});
					return def.promise;
				}
			});

			ns2 = ns.create('asynctest2', {
				foo: ns1
			});

			ns3 = ns2.create('asynctest3');
			ns3.foo = 'bar';
			a(isPromise(ns3.foo), true, "Unresolved");
			ns3.foo.end(function (val) {
				a(val, 'bar', "Promise: value");
				invoked = true;
			});
			nextTick(function () {
				a(invoked, true, "Promise: resolved");
				a(ns3.foo, 'bar', "Resolved");
				d();
			});
		},
		"FunctionType": function () {
			var ft = t.function;
			return {
				"": function (a) {
					var fn = function () {};
					a(ft(fn), fn, "Function");
					a.throws(function () {
						ft();
					}, "Undefined");
					a.throws(function () {
						ft(false);
					}, "Boolean");
					a.throws(function () {
						ft({});
					}, "Other object");
					a.throws(function () {
						ft(23423);
					}, "Number");
				},
				"Normalize": function (a) {
					var fn = function (value) { return 'foo' + value; }, fn2;
					a(ft.normalize(undefined), null, "Undefined");
					a(ft.normalize(null), null, "Null");
					a(ft.normalize(fn), fn, "Date");
					a(ft.normalize(false), null, "Boolean");
					a(ft.normalize({}), null, "Other object");
					fn2 = ft.normalize(fn.toString());
					a(isFunction(fn2), true, "Function string");
					a(fn2('bar'), 'foobar', "Function string: Code");
				},
				"Validate": function (a) {
					var fn = function () {};
					a(ft.validate(fn), fn, "Function");
					a.throws(function () {
						ft.validate();
					}, "Undefined");
					a.throws(function () {
						ft.validate(false);
					}, "Boolean");
					a.throws(function () {
						ft.validate({});
					}, "Other object");
					a.throws(function () {
						ft.validate(23423);
					}, "Number");
				}
			};
		}
	};
};
