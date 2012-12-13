'use strict';

var d           = require('es5-ext/lib/Object/descriptor')
  , forEach     = require('es5-ext/lib/Object/for-each')
  , contains    = require('es5-ext/lib/String/prototype/contains')
  , nextTick    = require('next-tick')
  , unserialize = require('./unserialize')
  , objects     = require('./objects')
  , signals     = require('./signal')

  , history = signals.history, emit = signals._emit
  , create = objects._create, createObject = objects._createObject
  , defineProperties = Object.defineProperties

  , byStamp = function (a, b) { return b._stamp - a._stamp; }

  , Imported, notifyData = {}, notify;

Imported = function (sourceId, stamp) {
	defineProperties(this, {
		_sourceId: d(sourceId),
		_stamp: d(stamp),
		_order: d([]),
		_importSourceMap: d({})
	});
	signals[sourceId + ':' + stamp] = this;
};

notify = (function () {
	var scheduled = false, notify;

	notify = function () {
		scheduled = false;
		forEach(notifyData, function (signal, id) {
			delete notifyData[id];
			emit(signal);
		});
	};

	return function (id, signal) {
		notifyData[id] = signal;
		if (scheduled) return;
		scheduled = true;
		nextTick(notify);
	};
}());

//                         Where     When   Who    What  …no need to know Why
module.exports = function (sourceId, stamp, objId, value, importSourceId) {
	var id = sourceId + ':' + stamp, signal = signals[id], obj;

	if (!signal) signal = new Imported(sourceId, stamp);

	// Unserialize value
	if (contains.call(objId, ':')) {
		value = unserialize(value);
	} else {
		value = value ? (objects[value] || createObject(value)) : undefined;
	}

	signal._importSourceMap[objId] = importSourceId;
	notify(id, signal);
	if (signal.hasOwnProperty(objId)) return;

	signal[objId] = value;
	signal._order.push(objId);

	if (history[objId]) {
		if (history[objId][0] && (history[objId][0]._stamp > signal._stamp)) {
			// Outdated update
			history[objId].unshift(signal);
			history[objId].sort(byStamp);
			return;
		}
	} else {
		history[objId] = [];
	}
	obj = objects[objId];
	if (contains.call(objId, ':')) {
		if (!obj) obj = create(objId);
		history[objId].unshift(signal);
		obj.$setValue(value);
	} else {
		if (!obj) obj = createObject(objId, value);
		history[objId].unshift(signal);
		obj.$proto(value);
	}
};
