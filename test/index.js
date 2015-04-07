'use strict';

var getUid   = require('time-uuid/time')
  , Database = require('../');

module.exports = function (a) {
	var db = new Database(), obj1 = new db.Object(), obj2 = new db.Object()
	  , observable;

	a(db.objects.has(db.String.prototype), true, "Objects: Native objects");
	a(db.objects.has(obj1) && db.objects.has(obj2), true,
		"Objects: User objects");

	db.unserializeEvent(String(getUid()) + '.' + obj1.__id__ + '/test.3bar');
	a(obj1.test, 'bar', "Unserialize event");

	db._update_(obj1.__id__ + '/test', 'marko');
	a(obj1.test, 'marko', "_update_");

	db.Object.prototype.defineProperties({
		partners: { multiple: true, type: db.Object },
		tmpPartners: { multiple: true, value: function () {
			return this.partners;
		} },
		requiredSubmissions: { multiple: true, value: function () {
			var result = [];
			this.tmpPartners.forEach(function (item) {
				result.push(item);
			});
			return result;
		} },
		documentsStatus: { value: function (_observe) {
			var first = this.requiredSubmissions.first;
			return first ? _observe(first._partners).size : null;
		} },
		staticA: { value: true },
		staticB: { value: true },
		computedA: { value: function () {
			return this.staticA;
		} },
		computedB: { value: function () {
			return this.computedA && this.staticA;
		} },
		computedC: { value: function () {
			if (!this.computedA) return null;
			if (!this.computedB) return null;
			return true;
		} },
		computedD: { value: function () {
			if (!this.computedB) return null;
			return true;
		} }
	});

	obj1.partners.add(obj2);
	observable = obj1._documentsStatus;
	a(observable.value, 0);
	db.objects.delete(obj2);
	a(observable.value, null);

	a(obj1._computedC.value, true);
	a(obj1._computedD.value, true);
	obj1.staticA = false;
	a(obj1._computedC.value, null);
	a(obj1._computedD.value, null);
};
