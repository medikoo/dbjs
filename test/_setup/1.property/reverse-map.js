'use strict';

var toArray  = require('es5-ext/array/to-array')
  , Database = require('../../../');

module.exports = function (a) {
	var db = new Database()
	  , Type1 = db.Object.extend('Test1')
	  , Type2 = db.Object.extend('Test2',
			{ foo: { type: Type1, required: true } })

	  , obj11, obj12, obj13, obj14, obj15, obj21, obj22, Type3, obj31, obj32
	  , obj33, events1 = [], events2 = [], filter;

	obj11 = new Type1({ melasa: 'dwa' });
	obj21 = new Type2({ foo: obj11 });

	Type2.prototype.$foo.reverse = 'bar';
	a.deep(toArray(obj11.bar), [obj21], "Init");

	obj22 = new Type2({ foo: obj11 });
	a.deep(toArray(obj11.bar), [obj21, obj22], "Add");

	obj12 = new Type1({ melasa: 'whatever' });
	a.deep(toArray(obj11.bar), [obj21, obj22], "Side");

	obj11.bar.once('change', function (event) {
		events1.push(event);
		delete event.dbjs;
	});
	obj12.bar.once('change', function (event) {
		events2.push(event);
		delete event.dbjs;
	});
	obj21.foo = obj12;
	a.deep(toArray(obj11.bar), [obj22], "Reverse update: Remove: value");
	a.deep(events1, [{ type: 'delete', value: obj21 }],
		"Reverse update: Remove: event");
	a.deep(toArray(obj12.bar), [obj21], "Reverse update: Add: value");
	a.deep(events2, [{ type: 'add', value: obj21 }],
		"Reverse update: Add: event");

	Type2.prototype.$foo.reverse = 'revreltest2';
	a(obj11.bar, undefined, "Rename: old #1");
	a(obj12.bar, undefined, "Rename: old #2");
	a.deep(toArray(obj11.revreltest2), [obj22], "Rename: new #1");
	a.deep(toArray(obj12.revreltest2), [obj21], "Rename: new #2");

	Type3 = Type2.extend('Revreltest3');
	Type3.prototype.$foo.reverse = 'ola';
	Type3.prototype.$foo.unique = true;

	obj13 = new Type1({ raz: 'dwa' });
	obj14 = new Type1({ trzy: 'cztery' });

	obj31 = new Type3({ foo: obj13 });
	obj32 = new Type3({ foo: obj14 });

	a(obj13.ola, obj31, "Reverse unique #1");
	a(obj14.ola, obj32, "Reverse unique #2");
	a.deep(toArray(obj13.revreltest2), [obj31], "Reverse deep #1");
	a.deep(toArray(obj14.revreltest2), [obj32], "Reverse deep #2");

	events1.length = 0;
	events2.length = 0;
	obj13._ola.once('change', function (event) {
		events1.push(event);
		delete event.dbjs;
	});
	obj11._ola.once('change', function (event) {
		events2.push(event);
		delete event.dbjs;
	});
	obj31.foo = obj11;
	a(obj13.ola, undefined, "Reverse unique: update: #1");
	a(obj11.ola, obj31, "Reverse unique: update: #2");
	a.deep(events1, [{ type: 'change', oldValue: obj31, newValue: undefined }],
		"Reverse unique update: Remove: event");
	a.deep(events2, [{ type: 'change', newValue: obj31, oldValue: undefined }],
		"Reverse update: Add: event");

	a.deep(toArray(obj13.revreltest2), [], "Reverse deep: update #1");
	a.deep(toArray(obj11.revreltest2), [obj22, obj31].sort(),
		"Reverse deep: update #2");

	// Test validateCreate:
	db.Object.extend('Revreltest4',
		{ revTest: { type: Type1, reverse: 'revreltest4' } });

	Type3._setValue_();
	a(obj11.ola, undefined, "NS changes #1");
	Type3._setValue_(Type2);
	a(obj11.ola, obj31, "NS changes #2");

	a.h1("Object Prototype turn");
	obj15 = new db.Object({ fafa: 'sdfs' });
	obj33 = new db.Object();

	a.h2("Plain objects");
	obj33.foo = obj15;
	a(obj33.foo, obj15, "Value");
	a(obj15.revreltest2, undefined, "Multi reverse");
	a(obj15.ola, undefined, "Single reverse");

	a.h2("Holder proto turn");
	obj33._setValue_(Type3.prototype);
	a(obj33.foo, null, "Value");
	a(obj15.revreltest2, undefined, "Multi reverse");
	a(obj15.ola, undefined, "Single reverse");

	a.h2("Value proto turn");
	obj15._setValue_(Type1.prototype);
	a(obj33.foo, obj15, "Value");
	a.deep(toArray(obj15.revreltest2), [obj33], "Multi reverse");
	a(obj15.ola, obj33, "Single reverse");

	a.h1("Postponed propagation");
	db.Object.extend('User', {
		roles: { type: db.String, multiple: true },
		isElo: { type: db.Boolean }
	});

	obj11 = new db.User({ roles: ['user'], isElo: false });
	obj12 = new db.User({ roles: ['user'], isElo: false });
	obj13 = new db.User({ roles: ['user'], isElo: true });
	obj14 = new db.User({ roles: ['user'], isElo: false });
	obj15 = new db.User({ roles: ['elo'], isElo: false });

	filter = db.User.find('roles', 'user').filterByKey('isElo', false);
	a(filter.size, 3, "Init");

	obj11._setValue_();
	obj12._setValue_();
	obj13._setValue_();
	obj14._setValue_();
	obj15._setValue_();

	a(filter.size, 0, "Clear");
};
