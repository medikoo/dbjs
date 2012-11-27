'use strict';

module.exports = function (t) {
	return {
		"Create": function (a) {
			var ns2, ns, ns1;

			ns = t.create(function () { return 'raz'; });
			ns.set('foo', 'bar');
			ns.prototype.set('raz', 234);
			ns1 = ns.create();
			a.not(ns, ns1, "Extension not same as origin");
			a(ns1('bar'), 'raz', "Constructor: Clone by default");
			a(ns1.foo, 'bar', "Constructor properties inherited");
			a(ns1.prototype.raz, 234, "Prototype properties inherited");

			ns2 = t.create(function (value) { return 'lorem' + value; });
			a(ns2('ipsum'), 'loremipsum', "Constructor");
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
