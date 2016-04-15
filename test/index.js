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

	db = new Database();
	db.Object.extend('ObjectExt', {
		steps: {
			nested: true,
			type: db.Object
		}
	});
	db.Object.extend('Step', {
		isSatisfied: { type: db.Boolean, value: true },
		isSatisfiedDeep: { type: db.Boolean, value: function (_observe) {
			if (!this.isSatisfied) return false;
			if (!this.previous) return true;
			return _observe(this.previous._isSatisfiedDeep);
		} }
	});
	db.Step.prototype.define('previous', { type: db.Step });
	db.ObjectExt.prototype.steps.defineProperties({
		first: { type: db.Step, nested: true },
		second: { type: db.Step, nested: true },
		third: { type: db.Step, nested: true }
	});

	db.ObjectExt.prototype.steps.second.defineProperties({
		previous: { value: function () { return this.owner.first; } }
	});
	db.ObjectExt.prototype.steps.third.defineProperties({
		previous: { value: function () { return this.owner.second; } }
	});

	obj1 = new db.ObjectExt();

	a(obj1.steps.third._isSatisfiedDeep.value, true);
	a(obj1.steps.second._isSatisfiedDeep.value, true);
	a(obj1.steps.first._isSatisfiedDeep.value, true);

	obj1.steps.first.isSatisfied = false;

	a(obj1.steps.third._isSatisfiedDeep.value, false);
	a(obj1.steps.second._isSatisfiedDeep.value, false);
	a(obj1.steps.first._isSatisfiedDeep.value, false);

	obj1.steps.third._isSatisfiedDeep.on('change', a.never);
	obj1.steps.second._isSatisfiedDeep.on('change', function (event, newValue) {
		if (event.newValue) obj1.steps.second.isSatisfied = false;
	});

	obj1.steps.first.isSatisfied = true;
};
