'use strict';

var d         = require('d')
  , nextTick  = require('next-tick')
  , now       = require('time-uuid/time')
  , serialize = require('./serialize/value')

  , ongoing, clear = function () { ongoing = null; }
  , increment = now.increment
  , count = 0, Event, zeroModeCount = 0;

Event = module.exports = function (obj, value, stamp, sourceId, index) {
	this.object = obj;
	this.value = value;
	this.index = isNaN(index) ? ++count : index;
	if (stamp == null) {
		if (Event.stampZeroMode) {
			stamp = ++zeroModeCount;
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
	// Firefox 49 happened to crash with 'TypeError: this is undefined' on `this.status = 2` call
	// Error is reported occasionally via remote client error reporter and doesn't seem to be
	// reproducible locally. Internet is also silent about such FF flaw.
	// Introduction of 'event' makes temporary workaround for that ugly issue
	var event = this;
	obj._history_._add_(this);
	event.status = 2;
};

Object.defineProperties(Event.prototype, {
	sourceId: d('0'),
	status: d(0),
	toString: d(function () {
		return this.stamp + '.' + this.object.__valueId__ + '.' +
			serialize(this.value);
	})
});
