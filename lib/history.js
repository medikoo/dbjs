'use strict';

var last    = require('es5-ext/lib/Array/prototype/last')
  , d       = require('es5-ext/lib/Object/descriptor')
  , forEach = require('es5-ext/lib/Object/for-each')
  , proto   = require('./_proto')

  , history = exports;

Object.defineProperties(proto, {
	_lastEvent_: d.gs(function () {
		var data = history.hasOwnProperty(this._id_) && history[this._id_];
		return (data && data[0]) || null;
	}),
	_lastModified_: d.gs(function () {
		var event = this._lastEvent_;
		return (event && event.stamp) || 0;
	}),
	_lastModifiedDate_: d.gs(function () {
		var lastModified = this._lastModified_;
		return lastModified ? new Date(lastModified / 1000) : null;
	})
});

Object.defineProperty(history, '_snapshot', d(function () {
	var data = [], result;
	forEach(history, function (events, id) {
		if (!events.length || (events[0].value === undefined)) return;
		data[last.call(events).index] = events[0];
	});
	result = [];
	data.forEach(function (event) { result.push(event); });
	return result;
}));
