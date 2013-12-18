'use strict';

var d         = require('d/d')
  , nextTick  = require('next-tick')
  , now       = require('time-uuid/lib/time')
  , serialize = require('./serialize/value')

  , ongoing, clear = function () { ongoing = null; }
  , increment = now.increment
  , count = 0, Event;

Event = module.exports = function (obj, value, stamp) {
	this.object = obj;
	this.value = value;
	this.index = ++count;
	if (stamp == null) {
		if (ongoing) {
			stamp = increment();
		} else {
			stamp = now();
			nextTick(clear);
			ongoing = true;
		}
	}
	this.stamp = stamp;
	this.status = 1;
	obj._history_._add_(this);
	this.status = 2;
};

Object.defineProperties(Event.prototype, {
	sourceId: d('0'),
	status: d(0),
	toString: d(function () {
		return this.stamp + '.' + this.obj.__id__ + '.' + serialize(this.value);
	})
});
