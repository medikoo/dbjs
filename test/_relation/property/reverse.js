'use strict';

var Db = require('../../../');

module.exports = function (t, a) {
	var ns1 = Db.create('Revreltest1')
	  , ns2 = Db.create('Revreltest2', { foo: ns1.required })

	  , obj11, obj12, obj13, obj14, obj21, obj22, ns3, obj31, obj32
	  , delEvents = [], addEvents = [];

	obj11 = ns1({ melasa: 'dwa' });
	obj21 = ns2({ foo: obj11 });

	ns2.prototype._foo.reverse = 'bar';
	a.deep(obj11.bar.values, [obj21], "Init");

	obj22 = ns2({ foo: obj11 });
	a.deep(obj11.bar.values.sort(), [obj21, obj22].sort(), "Add");

	obj12 = ns1({ melasa: 'whatever' });
	a.deep(obj11.bar.values.sort(), [obj21, obj22].sort(), "Side");

	obj11.bar.once('delete', function (obj) { delEvents.push(obj); });
	obj12.bar.once('add', function (obj) { addEvents.push(obj); });
	obj21.foo = obj12;
	a.deep(obj11.bar.values, [obj22], "Replace #1");
	a.deep(obj12.bar.values, [obj21], "Replace #2");
	a.deep(delEvents, [obj21], "Replace: Delete event");
	a.deep(addEvents, [obj21], "Replace: Add event");

	ns2.prototype._foo.reverse = true;
	a(obj11.bar, undefined, "Rename: old #1");
	a(obj12.bar, undefined, "Rename: old #2");
	a.deep(obj11.revreltest2.values, [obj22], "Rename: new #1");
	a.deep(obj12.revreltest2.values, [obj21], "Rename: new #2");

	ns1.prototype.set('revreltest2', 14);
	a(obj11.revreltest2, 14, "Reset relation");
	ns2.prototype._foo.reverse = true;
	a.deep(obj11.revreltest2.values, [obj22], "Override reverse");

	ns3 = ns2.create('Revreltest3');
	ns3.prototype._foo.reverse = 'ola';
	ns3.prototype._foo.unique = true;

	obj13 = ns1({ raz: 'dwa' });
	obj14 = ns1({ trzy: 'cztery' });

	obj31 = ns3({ foo: obj13 });
	obj32 = ns3({ foo: obj14 });

	a(obj13.ola, obj31, "Reverse unique #1");
	a(obj14.ola, obj32, "Reverse unique #2");
	a.deep(obj13.revreltest2.values, [obj31], "Reverse deep #1");
	a.deep(obj14.revreltest2.values, [obj32], "Reverse deep #2");

	delEvents = [];
	addEvents = [];
	obj13._ola.once('change', function (nu, old) { delEvents.push(nu, old); });
	obj11._ola.once('change', function (nu, old) { addEvents.push(nu, old); });
	obj31.foo = obj11;
	a(obj13.ola, null, "Reverse unique: update: #1");
	a(obj11.ola, obj31, "Reverse unique: update: #2");
	a.deep(delEvents, [null, obj31], "Unique: Delete event");
	a.deep(addEvents, [obj31, null], "Unique: Add event");
	a.deep(obj13.revreltest2.values, [], "Reverse deep: update #1");
	a.deep(obj11.revreltest2.values.sort(), [obj22, obj31].sort(),
		"Reverse deep: update #2");

	// Test validateCreate:
	Db.create('Revreltest4', { revTest: ns1.rel({ reverse: true }) });
};
