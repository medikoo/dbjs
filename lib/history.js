'use strict';

var d     = require('es5-ext/lib/Object/descriptor')
  , Proto = require('./_proto')

  , history = exports, lastEvent, lastModified;

Object.defineProperties(Proto, {
	_lastEvent_: d.gs('c', lastEvent = function () {
		var data = history.hasOwnProperty(this._id_) && history[this._id_];
		return (data && data[0]) || null;
	}),
	_lastModified_: d.gs('c', lastModified = function () {
		var event = this._lastEvent_;
		return (event && event.stamp) || 0;
	})
});

Object.defineProperties(Proto.prototype, {
	_lastEvent_: d.gs(lastEvent),
	_lastModified_: d.gs(lastModified)
});
