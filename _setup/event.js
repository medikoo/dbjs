'use strict';

var d         = require('d/d')
  , nextTick  = require('next-tick')
  , now       = require('time-uuid/lib/time')
  , serialize = require('./serialize/value')

  , ongoing, clear = function () { ongoing = null; }
  , increment = now.increment
  , count = 0, Event;

Event = module.exports = function (obj, value, stamp, sourceId) {
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
	if (sourceId != null) this.sourceId = sourceId;
	this.status = 1;
	obj._history_._add_(this);
	this.status = 2;
};

Object.defineProperties(Event.prototype, {
	sourceId: d('0'),
	status: d(0),
	toString: d(function () {
		var obj = this.object, id;
		id = ((obj._kind_ === 'descriptor') && obj._sKey_)
			? obj.object.__id__ + '/' + obj._sKey_
			: obj.__id__;
		return this.stamp + '.' + id + '.' + serialize(this.value);
	})
});
