'use strict';

var toArray  = require('es6-iterator/to-array')
  , isSet    = require('es6-set/is-set')
  , Database = require('../../../');

module.exports = function (a) {
	var db = new Database(), obj = new db.Object(), desc = obj.$getOwn('test')
	  , event, set;

	obj.test = 234;
	desc.multiple = true;
	a(isSet(set = obj.test), true, "Multiple");
	a.deep(toArray(obj.test), [], "Value");

	obj._test.on('change', function (e) { event = e; });
	desc.multiple = false;
	a.deep(event, { type: 'change', newValue: 234, oldValue: set,
		dbjs: event.dbjs }, "Force udpate");
	a(obj.test, 234, "Multiple: false");
};
