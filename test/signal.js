'use strict';

var Db   = require('../')

  , Base = Db.Base
  , keys = Object.keys;

module.exports = function (t) {
	return {
		"Events": function (a) {
			var ns = Base.create('SignalTest1')
			  , emitted = {}, event;

			t.on('signal', function (data) {
				var name = '*';
				if (!emitted[name]) emitted[name] = [];
				emitted[name].push(data);
			});
			ns.on('signal', function (data) {
				var name = 'SignalTest1*';
				if (!emitted[name]) emitted[name] = [];
				emitted[name].push(data);
			});
			ns._getRel_('fooSigTest').on('signal', function (data) {
				var name = 'SignalTest1:fooSigTest*';
				if (!emitted[name]) emitted[name] = [];
				emitted[name].push(data);
			});

			ns._fooSigTest.$$setValue('trzy');
			ns._fooSigTest._signal_('trzy');
			ns._getRel_('fooSigTest2').$$setValue(34);
			ns._fooSigTest2._signal_(34);

			event = emitted['*'][0];
			a.deep(keys(emitted).sort(),
				['*', 'SignalTest1*', 'SignalTest1:fooSigTest*'].sort(), "Events");

			a(emitted['*'].length, 2, "* Events length");
			a.deep(emitted['*'][0], { stamp: event.stamp, obj: ns._fooSigTest,
				value: 'trzy', sourceId: '0' }, "* Event #1");
			a.deep(emitted['*'][1], { stamp: event.stamp, obj: ns._fooSigTest2,
				value: 34, sourceId: '0' }, "* Event #2");

			a.deep(emitted['SignalTest1*'], emitted['*'], "NS* Events");

			a.deep(emitted['SignalTest1:fooSigTest*'], [event], "NS:prop Events");
		},
		"Import": function (a) {
			var obj = Db();
			t._add({
				obj: obj._getRel_('signalAddTest'),
				value: 34,
				sourceId: '0',
				stamp: 0
			}, true);
			a(obj.signalAddTest, 34, "Import new");
			t._add({
				obj: obj._signalAddTest,
				value: 58,
				sourceId: '0',
				stamp: 3
			}, true);
			a(obj.signalAddTest, 58, "Import newer");
			t._add({
				obj: obj._signalAddTest,
				value: 23,
				sourceId: '0',
				stamp: 1
			}, true);
			a(obj.signalAddTest, 58, "Import older");
			t._add({
				obj: obj._signalAddTest,
				value: 1232,
				sourceId: '0',
				stamp: 100
			}, false);
			a(obj.signalAddTest, 58, "Import, no set");
		},
		"ForEachReverse": function (a) {
			var ns1 = Db.create('FORTest1')
			  , ns2 = Db.create('FORTest2')
			  , obj1 = ns1({ foo: 'bar' })
			  , obj2 = ns2({ rel: obj1 })
			  , data = [];

			obj1._forEachReverse_(function () { data.push(arguments); });
			a(data.length, 1, "Count");
			a.deep(data[0], [obj2._rel, obj2._rel._id_, obj1], "Content");
		}
	};
};
