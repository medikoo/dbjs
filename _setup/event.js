'use strict';

var d         = require('d')
  , nextTick  = require('next-tick')
  , now       = require('time-uuid/time')
  , serialize = require('./serialize/value')

  , ongoing, clear = function () { ongoing = null; }
  , increment = now.increment
  , count = 0, Event;

Event = module.exports = function (obj, value, stamp, sourceId, index) {
	this.object = obj;
	this.value = value;
	this.index = isNaN(index) ? ++count : index;
	if (stamp == null) {
		if (Event.stampZeroMode) {
			stamp = 0;
		} else if (ongoing) {
			stamp = increment();
		} else {
			stamp = now();
			nextTick(clear);
			ongoing = true;
		}
	}
	this.stamp = stamp;
	if (sourceId != null) this.sourceId = sourceId;
	this.status = 1;
	obj._history_._add_(this);
	this.status = 2;
};

Object.defineProperties(Event.prototype, {
	sourceId: d('0'),
	status: d(0),
	toString: d(function () {
		return this.stamp + '.' + this.object.__valueId__ + '.' +
			serialize(this.value);
	})
});
