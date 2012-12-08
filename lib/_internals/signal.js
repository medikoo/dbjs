'use strict';

var d         = require('es5-ext/lib/Object/descriptor')
  , isEmpty   = require('es5-ext/lib/Object/is-empty')
  , contains  = require('es5-ext/lib/String/prototype/contains')
  , ee        = require('event-emitter')
  , nextTick  = require('next-tick')
  , now       = require('time-uuid/lib/time')
  , serialize = require('./serialize')
  , objects   = require('./objects')

  , isArray = Array.isArray
  , defineProperty = Object.defineProperty, keys = Object.keys

  , current = null, history = {}
  , Signal, signals, commit;

commit = function () {
	var signal;
	if (!current) return;
	signal = current;
	current = null;
	if (isEmpty(signal)) {
		delete signals[signal._sourceId + ':' + signal._stamp];
		return;
	}
	signals.emit('data', signal);
};

Signal = function () {
	defineProperty(this, '_stamp', d(now()));
	signals[this._sourceId + ':' + this._stamp] = this;
	nextTick(commit);
};
Signal.prototype._sourceId = '0';

signals = module.exports = ee(function (obj, value) {
	var id = obj._id_;
	if (!current) current = new Signal();
	objects[id] = obj;
	if (!current.hasOwnProperty(id)) {
		if (!history[id]) history[id] = [];
		history[id].unshift(current);
	}
	if (isArray(value)) {
		current[id] = null;
		value.forEach(function (value) {
			var prop = obj[serialize(value)]
			  , id = prop._id_;
			objects[id] = prop;
			if (!current.hasOwnProperty(id)) {
				if (!history[id]) history[id] = [];
				history[id].unshift(current);
			}
			current[id] = true;
		});
		return;
	}
	current[id] = value;
});

Object.defineProperties(signals, {
	rollback: d(function () {
		if (!current) return;
		keys(current).forEach(function (id) {
			var previous, his = history[id];
			if (his[0] !== current) {
				his.splice(his.indexOf(current), 1);
				return;
			}
			his.shift();
			previous = his[0] && his[0][id];
			if (contains.call(id, ':')) objects[id].$setValue(previous);
			else objects[id].$proto(previous);
			delete current[id];
		});
	}),
	history: d(history),
	sourceId: d.gs(function () { return Signal.prototype._sourceId; },
		function (value) { Signal.prototype._sourceId = String(value); })
});
