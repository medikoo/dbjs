'use strict';

var nextTick = require('next-tick')
  , now      = require('time-uuid/lib/time')
  , Base     = require('../../lib/types-base/base');

require('../../lib/types-base/string');

module.exports = function (t, a, d) {
	var ns = Base.create('SigImpTest')
	  , ns2 = ns.create('SigImpTest2');

	ns.set('raz77', 'miszka');
	ns._raz77.set('dwa77', 'marko');
	ns.set('trzy77', ['raz', 'dwa']);
	ns._trzy77['3raz'].set('hej77', 34);

	setTimeout(function () {
		var stamp = now();

		// prop
		t('test', stamp, ns._raz77._id_, '2234');
		// prop:prop
		t('test', stamp, ns._raz77._dwa77._id_, '3elele');
		// prop:item
		t('test', stamp, ns._trzy77['3dwa']._id_, '');
		// prop:item:prop
		t('test', stamp, ns._trzy77['3raz']._hej77._id_, '277');
		// proto
		t('test', stamp, ns2._id_, Base._id_);

		nextTick(function () {
			a(ns._raz77._value, 234, "Prop");
			a(ns._raz77.dwa77, 'elele', "Prop: Prop");
			a(ns.trzy77.has('dwa'), false, "Prop: Item");
			a(ns.trzy77.getItemProperties('raz').hej77, 77, "Prop: Item: Prop");
			a(Object.getPrototypeOf(ns2), Base, "Proto");
			d();
		});
	}, 50);
};
