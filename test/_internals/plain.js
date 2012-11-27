'use strict';

var DateTime = require('../../lib/types/date-time');

module.exports = function (t) {
	return {
		"Create": function (a) {
			var ns2, ns, ns1;

			ns = t.create(function () { return 'raz'; },
				 { foo: 'bar' }, { raz: 234 });
			ns1 = ns.create();
			a.not(ns, ns1, "Extension not same as origin");
			a(ns1('bar'), 'raz', "Constructor: Clone by default");
			a(ns1.foo, 'bar', "Constructor properties inherited");
			a(ns1.prototype.raz, 234, "Prototype properties inherited");

			ns2 = t.create(function (value) { return 'lorem' + value; });
			a(ns2('ipsum'), 'loremipsum', "Constructor");

			ns2.set('trzy', DateTime.required);
			a.throws(function () { ns2.create({ trzy: 'foo' }); },
				"Validate");
			a.throws(function () { ns2.create({}); },
				"Completeness");
			a.throws(function () { ns2.create(); },
				"Completeness #2");
			ns2.prototype.set('foo', DateTime.required);
			a.throws(function () {
				ns2.create({ trzy: function () {} }, { foo: 'foo' });
			}, "Validate Prototype");

			try {
				ns2.create({ trzy: function () {} }, {});
				ns2.create({ trzy: function () {} }, { foo: function () {} });
			} catch (e) {
				console.log(e.subErrors);
				throw e;
			}

			ns1 = ns.create({ other: 15 }, { foo: 'raz' });

			a(ns1.other, 15, "Namespace property");
			a(ns1._other._value, 15, "Namespace relation");
			a(ns1.prototype.foo, 'raz', "Prototype property");
			a(ns1.prototype._foo._value, 'raz', "Prototype relation");
		},
		"Abstract": function (a) {
			var ns = t.create(), ns2;
			ns.set('trzy', null);
			ns._trzy.required = true;
			ns2 = ns.abstract();
			a(ns2.trzy, null, "Abstracted");
		},
		"Set": function (a) {
			var ns = t.create();
			a.throws(function () {
				ns.set('_foo', 'whatever');
			}, "Bad property name");

			ns.set('one', true);
			a(ns.one, true, "Value");
			ns.one = false;
			a(ns.one, false, "Updated");
			a(ns._one._value, false, "Value updated");
		},
		"SetMany": function (a) {
			var ns = t.create();
			ns.setMany({
				dwa: true,
				trzy: 23
			});
			a(ns.dwa, true, "#1");
			a(ns.trzy, 23, "#2");
		}
	};
};
