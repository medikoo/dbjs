'use strict';

var toArray  = require('es5-ext/array/to-array')
  , Database = require('../../../')
  , Event    = require('../../../_setup/event');

module.exports = function (a) {
	var db = new Database(), obj = new db.Object(), iterator, data;

	db.Object.prototype.$getOwn('test').multiple = true;

	obj.test = ['raz', 2, 'trzy', 4];

	iterator = obj.test.values();
	obj.test.add('pięć');
	obj.test.delete(2);
	a.deep(toArray(iterator), data = ['raz', 'trzy', 4, 'pięć'], "Modified");
	a.deep(toArray(obj.test), data, "Default iterator");

	db.DateTime.extend('Foo', {
		step: { value: 1000 * 60 * 60 * 24 },
		_validateCreate_: { value: function (value/*[, mth[, d[, h]]]*/) {
			var l = arguments.length, year, month, day;
			if (!l) {
				value = new Date();
				year = value.getFullYear();
				month = value.getMonth();
				day = value.getDate();
				value.setUTCFullYear(year);
				value.setUTCMonth(month);
				value.setUTCDate(day);
			} else if (l === 1) {
				value = new Date(value);
			} else {
				value = new Date(Date.UTC(value, arguments[1], (l > 2) ? arguments[2] : 1,
					(l > 3) ? arguments[3] : 0));
			}
			return [this.database.DateTime.validate.call(this, value)];
		} },
		normalize: { value: function (value/*, descriptor*/) {
			var year, month, date;
			if (!value) return this.database.DateTime.normalize.apply(this, arguments);
			if (value instanceof this) return this.database.DateTime.normalize.apply(this, arguments);
			if (Object.prototype.toString.call(value) !== '[object Date]') {
				return this.database.DateTime.normalize.apply(this, arguments);
			}
			year = value.getFullYear();
			month = value.getMonth();
			date = value.getDate();
			value = new Date(value);
			value.setUTCFullYear(year);
			value.setUTCMonth(month);
			value.setUTCDate(date);
			return this.database.DateTime.normalize.call(this, value, arguments[1]);
		} },
		validate: { value: function (value/*, descriptor*/) {
			var year, month, date;
			if (!value) return this.database.DateTime.validate.apply(this, arguments);
			if (value instanceof this) return this.database.DateTime.validate.apply(this, arguments);
			if (Object.prototype.toString.call(value) !== '[object Date]') {
				return this.database.DateTime.validate.apply(this, arguments);
			}
			year = value.getFullYear();
			month = value.getMonth();
			date = value.getDate();
			value = new Date(value);
			value.setUTCFullYear(year);
			value.setUTCMonth(month);
			value.setUTCDate(date);
			return this.database.DateTime.validate.call(this, value, arguments[1]);
		} }
	});
	db.Object.prototype.define('dates', {
		multiple: true,
		type: db.Foo
	});
	obj = db.objects.unserialize('Object#/dates*41420070400000');
	new Event(obj, true, 123); //jslint: ignore
	a(db.Object.prototype.dates.first instanceof db.Foo, true);
};
