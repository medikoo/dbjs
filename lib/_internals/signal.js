'use strict';

var clear     = require('es5-ext/lib/Array/prototype/clear')
  , d         = require('es5-ext/lib/Object/descriptor')
  , forEach   = require('es5-ext/lib/Object/for-each')
  , isEmpty   = require('es5-ext/lib/Object/is-empty')
  , contains  = require('es5-ext/lib/String/prototype/contains')
  , endsWith  = require('es5-ext/lib/String/prototype/ends-with')
  , ee        = require('event-emitter')
  , nextTick  = require('next-tick')
  , now       = require('time-uuid/lib/time')
  , idSplit   = require('./id-split')

  , defineProperties = Object.defineProperties, keys = Object.keys

  , current = null, history = {}, objects, getObject
  , Signal, signals, commit, emit;

commit = function () {
	var signal, importId;
	if (!current) return;
	signal = current;
	current = null;
	if (isEmpty(signal)) {
		delete signals[signal._sourceId + ':' + signal._stamp];
		return;
	}
	emit(signal);
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
	_emit: d(emit = function (signal) {
		var importId = signal._importSourceId || null;
		signal._order.forEach(function (id) {
			var i, l, current, obj, value;
			value = signal[id];
			obj = getObject(id);
			signals.emit('*', obj, value, signal, importId);
			if (value && value._id_) signals.emit('*' + value._id_, obj, signal);
			id = idSplit(id);
			l = id.length;
			if (l === 1) return;
			current = id[0];
			for (i = 1; i < l; ++i) {
				signals.emit(current + '*', obj, value, signal);
				current += ':' + id[i];
			}
		});
	}),
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

objects = require('./objects');
getObject = objects._get;
