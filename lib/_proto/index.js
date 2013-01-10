'use strict';

var d          = require('es5-ext/lib/Object/descriptor')
  , callable   = require('es5-ext/lib/Object/valid-callable')
  , startsWith = require('es5-ext/lib/String/prototype/starts-with')
  , ee         = require('event-emitter')

  , call = Function.prototype.call
  , getOwnPropertyNames = Object.getOwnPropertyNames

  , lastModified, Proto, history;

module.exports = Proto = ee(Object.defineProperties(function () {}, {
	_lastModified_: d.gs('c', lastModified = function () {
		var data;
		if (!this._id_) return null;
		data = history[this._id_];
		return (data && data[0] && data[0].stamp) || 0;
	}),
	_forEachRelation_: d('c', function (cb/*, thisArg*/) {
		var thisArg = arguments[1];
		callable(cb);
		getOwnPropertyNames(this).forEach(function (name) {
			var rel;
			if (!startsWith.call(name, '__')) return;
			rel = this[name];
			if (!rel) return;
			if (rel._type_ !== 'relation') return;
			call.call(cb, thisArg, rel, rel._id_, this);
		}, this);
	}),
	_everyRelationDeep_: d('c', function (cb/*, thisArg*/) {
		var thisArg = arguments[1], forRelation, forItem;
		callable(cb);
		forRelation = function (rel) {
			if (!call.call(cb, thisArg, rel, rel._id_, this)) return;
			rel._forEachRelation_(forRelation, this);
			rel._forEachItem_(forItem, this);
		};
		forItem = function (item) {
			if (!call.call(cb, thisArg, item, item._id_, this)) return;
			item._forEachRelation_(forRelation, this);
		};
		this._forEachRelation_(forRelation, this);
	})
}));

ee(Object.defineProperties(Proto.prototype, {
	_lastModified_: d.gs(lastModified),
	_forEachRelation_: d(Proto._forEachRelation_),
	_everyRelationDeep_: d(Proto._everyRelationDeep_)
}));

require('./instance');
require('./property');
require('./properties');
require('../signal');

history = require('../history');