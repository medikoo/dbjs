'use strict';

var d           = require('es5-ext/lib/Object/descriptor')
  , forEach     = require('es5-ext/lib/Object/for-each')
  , contains    = require('es5-ext/lib/String/prototype/contains')
  , nextTick    = require('next-tick')
  , unserialize = require('./unserialize')
  , objects     = require('./objects')
  , signals     = require('./signal')

  , history = signals.history
  , create = objects._create, createObject = objects._createObject
  , defineProperties = Object.defineProperties

  , waiting = {}
  , byStamp = function (a, b) { return b._stamp - a._stamp; }

  , Imported, schedule, idsByStamp;

idsByStamp = function (a, b) { return signals[b]._stamp - signals[a]._stamp; };

Imported = function (sourceId, stamp) {
	defineProperties(this, {
		_sourceId: d(sourceId),
		_stamp: d(stamp)
	});
	signals[sourceId + ':' + stamp] = this;
};

schedule = (function () {
	var scheduled, process;
	process = function () {
		scheduled = false;
		forEach(waiting, function self(signalId, objId) {
			var signal, obj, value;
			delete waiting[objId];
			if (typeof signalId !== 'string') {
				signalId.sort(idsByStamp).forEach(function (signalId) {
					self(signalId, objId);
				});
				return;
			}
			signal = signals[signalId];
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
			value = signal[objId];
			if (contains.call(objId, ':')) {
				if (!obj) obj = create(objId);
				history[objId].unshift(signal);
				obj.$setValue(value);
			} else {
				if (!obj) obj = createObject(objId, value);
				history[objId].unshift(signal);
				obj.$proto(value);
			}
		});
	};
	return function () {
		if (scheduled) return;
		scheduled = true;
		nextTick(process);
	};
}());

//                         Where     When   Who    What  …no need to know Why
module.exports = function (sourceId, stamp, objId, value) {
	var id = sourceId + ':' + stamp
	  , signal = signals[sourceId + ':' + stamp];

	if (!signal) signal = new Imported(sourceId, stamp);

	// Unserialize value
	if (contains.call(objId, ':')) {
		value = unserialize(value);
	} else {
		value = value ? (objects[value] || createObject(value)) : undefined;
	}
	signal[objId] = value;

	// Set for dispatch and schedule for next tick
	if (waiting[objId]) {
		if (typeof waiting[objId] === 'string') waiting[objId] = [waiting[objId]];
		waiting[objId].push(id);
	} else {
		waiting[objId] = id;
	}
	schedule();
};
