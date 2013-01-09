'use strict';

var d          = require('es5-ext/lib/Object/descriptor')
  , startsWith = require('es5-ext/lib/String/prototype/starts-with')
  , ee         = require('event-emitter')

  , getOwnPropertyNames = Object.getOwnPropertyNames

  , lastModified, relations, Proto, history;

module.exports = Proto = ee(Object.defineProperties(function () {}, {
	lastModified: d.gs('c', lastModified = function () {
		var data;
		if (!this._id_) return null;
		data = history[this._id_];
		return (data && data[0] && data[0].stamp) || 0;
	}),
	_relations_: d.gs('c', relations = function () {
		var relations = [];
		getOwnPropertyNames(this).forEach(function (name) {
			var prop;
			if (!startsWith.call(name, '__')) return;
			prop = this[name];
			if (!prop) return;
			if (prop._type_ !== 'relation') return;
			relations.push(prop);
		}, this);
		return relations;
	}),
	_forEachObject_: d('c', function (cb, thisArg) {
		getOwnPropertyNames(this).forEach(function (name) {
			var prop;
			if (!startsWith.call(name, '__')) return;
			prop = this[name];
			if (!prop) return;
			if (prop._type_ !== 'relation') return;
			if (!prop.hasOwnProperty('_value')) return;
			cb.call(thisArg, prop, prop._id_, this);
		}, this);
	}),
	_iterate_: d('c', function (cb, thisArg) {
		var done, iterate, iterateReverse;
		if (!this._id_) return null;
		done = {};
		done[this._id_] = true;
		iterateReverse = function (rel, id, parent) {
			var obj = rel.obj;
			id = obj._id_;
			if (done.hasOwnProperty(id)) return;
			done[id] = true;
			if (!cb.call(thisArg, obj, id, rel, true)) return;
			obj._forEachObject_(iterate);
			if (obj._forEachReverse_) obj._forEachReverse_(iterate);
		};
		this._forEachObject_(iterate = function (obj, id, parent) {
			if (done.hasOwnProperty(id)) return;
			done[id] = true;
			if (!cb.call(thisArg, obj, id, parent)) return;
			obj._forEachObject_(iterate);
			if (obj._forEachReverse_) obj._forEachReverse_(iterateReverse);
		});
		if (this._forEachReverse_) this._forEachReverse_(iterateReverse);
	})
}));

ee(Object.defineProperties(Proto.prototype, {
	lastModified: d.gs(lastModified),
	_relations_: d.gs(relations),
	_forEachObject_: d(Proto._forEachObject_),
	_iterate_: d(Proto._iterate_)
}));

require('./instance');
require('./property');
require('./properties');
require('../signal');

history = require('../history');
