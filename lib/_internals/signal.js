'use strict';

var d         = require('es5-ext/lib/Object/descriptor')
  , forEach   = require('es5-ext/lib/Object/for-each')
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
	var signal, any;
	if (!current) return;
	forEach(current, function (value, id) {
		if (!history[id]) history[id] = [];
		history[id].unshift(current);
		any = true;
	});
	signal = current;
	current = null;
	if (!any) {
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
	if (!current) current = new Signal();
	objects[obj._id_] = obj;
	if (isArray(value)) {
		current[obj._id_] = null;
		value.forEach(function (value) {
			var prop = obj[serialize(value)];
			objects[prop._id_] = prop;
			current[prop._id_] = true;
		});
		return;
	}
	current[obj._id_] = value;
});

Object.defineProperties(signals, {
	rollback: d(function () {
		if (!current) return;
		keys(current).forEach(function (id) {
			var previous = history[id] && history[id][0] && history[id][0][id];
			if (contains.call(id, ':')) objects[id].$setValue(previous);
			else objects[id].$proto(previous);
			delete current[id];
		});
	}),
	history: d(history),
	sourceId: d.gs(function () { return Signal.prototype._sourceId; },
		function (value) { Signal.prototype._sourceId = String(value); })
});
