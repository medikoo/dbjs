'use strict';

var Database = require('../../../')

  , getPrototypeOf = Object.getPrototypeOf;

module.exports = function (a) {
	var db = new Database(), proto = db.Object.prototype, obj = new db.Object()
	  , protoDesc, protoSet, set, item, protoItem;

	protoDesc = proto.$getOwn('foo');
	protoDesc.multiple = true;

	set = obj.foo;
	item = set.$getOwn('foo');
	protoSet = proto.foo;
	protoItem = protoSet.$getOwn('foo');

	a(getPrototypeOf(item), protoItem, "Item prototype");
	a(item._resolveValue_(), undefined, "Initial value");
	protoSet.add('foo');
	a(item._resolveValue_(), true, "Prototype: Add");

	db.Object.prototype.define('dates', {
		multiple: true,
		type: db.DateTime
	});
	obj = db.objects.unserialize('Object#/dates*41420070400000');
	a(obj.key instanceof db.DateTime, true);

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
	db.Object.prototype.define('dates2', {
		multiple: true,
		type: db.Foo
	});
	obj = new db.Object();
	var date = new Date(2012, 2, 3, 12, 34);
	obj.dates2.add(date);
	var createdDate = obj.dates2.first;
	a.not(date, createdDate);
	obj.dates2.on('change', function (event) {
		a(event.value, createdDate);
	});
	obj.dates2.delete(date);
	a(obj.dates2.size, 0);
};
