'use strict';

var clear     = require('es5-ext/lib/Array/prototype/clear')
  , d         = require('es5-ext/lib/Object/descriptor')
  , isEmpty   = require('es5-ext/lib/Object/is-empty')
  , contains  = require('es5-ext/lib/String/prototype/contains')
  , ee        = require('event-emitter')
  , nextTick  = require('next-tick')
  , now       = require('time-uuid/lib/time')
  , objects   = require('./objects')

  , defineProperties = Object.defineProperties, keys = Object.keys

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
	defineProperties(this, {
		_stamp: d(now()),
		_order: d([])
	});
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
	} else {
		current._order.splice(current._order.indexOf(id), 1);
	}
	current._order.push(id);
	current[id] = value;
});

defineProperties(signals, {
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
		clear.call(current._order);
	}),
	history: d(history),
	sourceId: d.gs(function () { return Signal.prototype._sourceId; },
		function (value) { Signal.prototype._sourceId = String(value); })
});
