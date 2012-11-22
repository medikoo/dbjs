'use strict';

var ObjectType = require('../../lib/types/object');

module.exports = function (t, a) {
	var ns1 = ObjectType.create('revreltest1')
	  , ns2 = ObjectType.create('revreltest2', { foo: ns1.required })

	  , obj11, obj12, obj13, obj14, obj21, obj22, ns3, obj31, obj32;

	obj11 = ns1({ melasa: 'dwa' });
	obj21 = ns2({ foo: obj11 });

	ns2.prototype._foo.reverse = 'bar';
	a.deep(obj11.bar.values, [obj21], "Init");

	obj22 = ns2({ foo: obj11 });
	a.deep(obj11.bar.values.sort(), [obj21, obj22].sort(), "Add");

	obj12 = ns1({ melasa: 'whatever' });
	a.deep(obj11.bar.values.sort(), [obj21, obj22].sort(), "Side");

	obj21.foo = obj12;
	a.deep(obj11.bar.values, [obj22], "Remove #1");
	a.deep(obj12.bar.values, [obj21], "Remove #2");

	ns2.prototype._foo.reverse = 'miszka';
	a(obj11.bar, undefined, "Rename: old #1");
	a(obj12.bar, undefined, "Rename: old #2");
	a.deep(obj11.miszka.values, [obj22], "Rename: new #1");
	a.deep(obj12.miszka.values, [obj21], "Rename: new #2");

	ns3 = ns2.create('revreltest3');
	ns3.prototype._foo.reverse = 'ola';
	ns3.prototype._foo.unique = true;

	obj13 = ns1({ raz: 'dwa' });
	obj14 = ns1({ trzy: 'cztery' });

	obj31 = ns3({ foo: obj13 });
	obj32 = ns3({ foo: obj14 });

	a(obj13.ola, obj31, "Reverse unique #1");
	a(obj14.ola, obj32, "Reverse unique #2");
	a.deep(obj13.miszka.values, [obj31], "Reverse deep #1");
	a.deep(obj14.miszka.values, [obj32], "Reverse deep #2");

	obj31.foo = obj11;
	a(obj13.ola, null, "Reverse unique: update: #1");
	a(obj11.ola, obj31, "Reverse unique: update: #2");
	a.deep(obj13.miszka.values, [], "Reverse deep: update #1");
	a.deep(obj11.miszka.values.sort(), [obj22, obj31].sort(),
		"Reverse deep: update #2");
};
