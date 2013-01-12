'use strict';

var d         = require('es5-ext/lib/Object/descriptor')
  , relation  = require('../')
  , simple    = require('../simple')
  , serialize = require('../../utils/serialize')

  , rel, toSingular, toMultiple;

toSingular = function (rel, after) {
	var lastValue;
	if (rel.hasOwnProperty('_children_')) {
		rel._children_.forEach(function (rel) {
			if (rel._multiple.hasOwnProperty('_value')) return;
			toSingular(rel, after);
		});
	}
	if (rel.hasOwnProperty('_value') && (rel._value === null) &&
			rel._count_) {
		lastValue = rel._lastValue_;
		rel.forEach(function (value, item) { item._signal_(); });
		after.push(rel._signal_.bind(rel, lastValue));
	}
};

toMultiple = function (rel, after) {
	var value, key, item;
	if (rel.hasOwnProperty('_children_')) {
		rel._children_.forEach(function (rel) {
			if (rel._multiple.hasOwnProperty('_value')) return;
			toMultiple(rel, after);
		});
	}
	if (rel.hasOwnProperty('_value') && (rel._value != null) &&
			!rel._count_ && (typeof rel._value !== 'function') &&
			(rel.ns.normalize(rel._value) != null)) {
		value = rel._value;
		key = serialize(value);
		if (!key) return;
		rel._signal_(null);
		item = rel._getSetItem_(key, value);
		after.push(item._signal_.bind(item, true));
	}
};

rel = simple(relation._defineRel_('multiple'), relation);
rel.$$setValue(false);
rel._required.$$setValue(true);

Object.defineProperty(rel, '$setValue', d(function (value) {
	var old = this.__value, nu, after, fn;
	if (value === undefined) nu = this._value;
	else nu = value = Boolean(value);
	if (old !== nu) {
		if (!nu) toSingular(this.obj, after = []);
		else toMultiple(this.obj, after = []);
	}
	this._signal_(value);
	if (after) while ((fn = after.shift())) fn();
}));
