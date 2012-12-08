'use strict';

var nextTick = require('next-tick')
  , Base     = require('../../lib/types-base/base')
  , define   = require('../../lib/_internals/define').define;

module.exports = function (t, a, d) {
	var ns = Base.create('SignalTest1');
	setTimeout(function () {
		var emitted = [];
		t.on('data', function (data) { emitted.push(data); });

		define(ns, 'fooSigTest');
		ns._fooSigTest.$setValue('trzy');
		t(ns._fooSigTest, 'trzy');
		define(ns, 'fooSigTest2');
		ns._fooSigTest2.$setValue(34);
		t(ns._fooSigTest2, 34);

		nextTick(function () {
			var signal = emitted[0];
			a(emitted.length, 1, "Signal emitted");
			emitted.length = 0;
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
				a(emitted.length, 0, "Rollback: Signal");
				a.deep([ns.fooSigTest, ns.fooSigTest2], ['trzy', 34],
					"Rollback: Values");
				a.deep(t.history['SignalTest1:fooSigTest'], [signal], "History #1");
				a.deep(t.history['SignalTest1:fooSigTest2'], [signal], "History #2");
				d();
			});
		});
	}, 50);
};
