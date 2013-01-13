'use strict';

var extend    = require('es5-ext/lib/Object/extend')
  , serialize = require('./utils/serialize')

  , Event, count = 0;

Event = module.exports = function (obj, value, stamp) {
	this.obj = obj;
	this.value = value;
	this.stamp = stamp;
	this.index = ++count;
};

extend(Event.prototype, {
	sourceId: '0',
	toString: function () {
		return this.stamp + '.' + this.obj._id_ + '.' + serialize(this.value);
	}
});
