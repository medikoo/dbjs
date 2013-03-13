'use strict';

var memoize   = require('memoizee/lib/regular')
  , ObjectSet = require('./object-set')

  , defineProperties = Object.defineProperties
  , listByProperty, defineOn;

require('memoizee/lib/ext/method');

listByProperty = function (name) {
	var onadd, list = this.list(function (a, b) {
		if (!a._id_ || !a._type_) return String(a[name]).localeCompare(b[name]);
		return a.get(name).ns.compare(a[name], b[name]);
	});
	this.forEach(onadd = function (obj) {
		if (!obj._id_ || !obj._type_) return;
		obj.get(name).on('change', list._sort);
	});
	this.on('add', function (obj) {
		onadd(obj);
		list._sort();
	});
	this.on('delete', function (obj) {
		obj.get(name).off('change', list._sort);
		list._sort();
	});
	return list;
};

defineOn = exports.defineOn = function (set) {
	defineProperties(set, memoize(listByProperty, { method: 'listByProperty' }));
};
defineOn(ObjectSet.prototype);
