'use strict';

var toArray  = require('es5-ext/lib/Array/from')
  , nextTick = require('next-tick')
  , Base     = require('../../lib/types-base/base')
  , define   = require('../../lib/_internals/define').define

  , keys = Object.keys;

module.exports = function (t, a, d) {
	var ns = Base.create('SignalTest1');
	setTimeout(function () {
		var emitted = {};
		t.on('*', function (data) {
			var name = '*';
			if (!emitted[name]) emitted[name] = [];
			emitted[name].push(arguments);
		});
		t.on('SignalTest1*', function (data) {
			var name = 'SignalTest1*';
			if (!emitted[name]) emitted[name] = [];
			emitted[name].push(arguments);
		});
		t.on('SignalTest1:fooSigTest*', function (data) {
			var name = 'SignalTest1*';
			if (!emitted[name]) emitted[name] = [];
			emitted[name].push(arguments);
		});

		define(ns, 'fooSigTest');
		ns._fooSigTest.$setValue('trzy');
		t(ns._fooSigTest, 'trzy');
		define(ns, 'fooSigTest2');
		ns._fooSigTest2.$setValue(34);
		t(ns._fooSigTest2, 34);

		nextTick(function () {
			var signal = emitted['*'][0][2];
			a.deep(keys(emitted).sort(), ['*', 'SignalTest1*'].sort(), "Events");
			a(emitted['*'].length, 2, "* Events length");
			a.deep(toArray(emitted['*'][0]), [ns._fooSigTest, 'trzy', signal, null],
				"* Event #1");
			a.deep(toArray(emitted['*'][1]), [ns._fooSigTest2, 34, signal, null],
				"* Event #2");
			a.deep(toArray(emitted['SignalTest1*'][0]),
				[ns._fooSigTest2, 'trzy', signal], "NS* Event #2");

			emitted = {};

			a.deep(signal, { 'SignalTest1:fooSigTest': 'trzy',
				'SignalTest1:fooSigTest2': 34 }, "Signal data");
			a.deep(t.history['SignalTest1:fooSigTest'], [signal], "History #1");
			a.deep(t.history['SignalTest1:fooSigTest2'], [signal], "History #2");

			ns.fooSigTest = 'pięć';
			t(ns._fooSigTest, 'pięć');
			ns.fooSigTest2 = 54;
			t(ns._fooSigTest2, 54);

			t.rollback();
			nextTick(function () {
				a(keys(emitted).length, 0, "Rollback: Signal");
				a.deep([ns.fooSigTest, ns.fooSigTest2], ['trzy', 34],
					"Rollback: Values");
				a.deep(t.history['SignalTest1:fooSigTest'], [signal], "History #1");
				a.deep(t.history['SignalTest1:fooSigTest2'], [signal], "History #2");
				d();
			});
		});
	}, 50);
};
