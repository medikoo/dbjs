'use strict';

var d       = require('es5-ext/lib/Object/descriptor')
  , forEach = require('es5-ext/lib/Object/for-each')

  , defineProperties = Object.defineProperties

  , Index;

module.exports = Index = function (rel) {
	this._init(rel, {});
};
defineProperties(Index.prototype, {
	add: d(function (rel, value) {
		var key = rel._ns.__serialize(value);
		if (this[key]) ++this[key];
		else this[key] = 1;
	}),
	remove: d(function (rel, value) {
		value = rel._ns._normalize(value);
		if (value == null) return;
		--this[rel._ns.__serialize(value)];
	}),
	validate: d(function (rel, key, value) {
		if (this[key]) return new Error(value + " is already set on other object");
	}),
	_updateValueNs: d(function (value) {
		var oldKey, oldValue, key;
		oldValue = this.nsOld._normalize(value);
		if (oldValue == null) oldKey = null;
		else oldKey = this.nsOld.__serialize(oldValue);

		value = this.ns._normalize(value);
		if (value == null) key = null;
		else key = this.ns.__serialize(value);

		if (key === oldKey) return;

		// Remove old
		if (oldKey) --this[oldKey];

		// Add new
		if (key) {
			if (this[key]) ++this[key];
			else this[key] = 1;
		}
	}),
	updateNs: d(function (rel, nsOld) {
		this.nsOld = nsOld;
		this.ns = rel._ns;
		if (rel.hasOwnProperty('__set')) {
			forEach(rel.__set, this._updateValueNs, this);
		} else if (rel.hasOwnProperty('_value') && (rel._value == null)) {
			this._updateValueNs(rel._value);
		}
		if (!rel.hasOwnProperty('__children')) return;
		this.__children.forEach(function (child) {
			if (child.hasOwnProperty('_ns')) return;
			this._updateNs(child, nsOld);
		}, this);
	}),
	_processValue: d(function (value) {
		var key;
		value = this.ns._normalize(value);
		if (value == null) return;
		if (!(key = this.ns.__serialize(value))) return;
		if (this[key]) ++this[key];
		else this[key] = 1;
	}),
	_init: d(function (rel) {
		this.ns = rel._ns;
		if (rel.hasOwnProperty('count')) {
			forEach(rel, this._processValue, this);
		} else if (rel.hasOwnProperty('_value') && (rel._value == null)) {
			this._processValue(rel._value);
		}
		if (!rel.hasOwnProperty('__children')) return;
		this.__children.forEach(this._init, this);
	})
});
