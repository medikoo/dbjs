'use strict';

var d        = require('es5-ext/lib/Object/descriptor')
  , relation = require('../')
  , simple   = require('../simple')

  , rel, toSingular, toMultiple;

toSingular = function (rel) {
	var lastValue;
	if (rel.hasOwnProperty('_children_')) {
		rel._children_.forEach(function (rel) {
			if (rel._multiple.hasOwnProperty('_value')) return;
			toSingular(rel);
		});
	}
	if (rel.hasOwnProperty('_value') && (rel._value === null) &&
			rel._count_) {
		lastValue = rel._lastValue_;
		rel.forEach(function (value, item) { rel.$$delete(item._value); });
		rel.$$setValue(lastValue);
	}
};

toMultiple = function (rel) {
	var value;
	if (rel.hasOwnProperty('_children_')) {
		rel._children_.forEach(function (rel) {
			if (rel._multiple.hasOwnProperty('_value')) return;
			toMultiple(rel);
		});
	}
	if (rel.hasOwnProperty('_value') && (rel._value != null) &&
			!rel._count_ && (typeof rel._value !== 'function') &&
			!rel.ns.prototype.validateCreate(rel._value)) {
		value = rel._value;
		rel.$$setValue(null);
		rel.$$add(value);
	}
};

rel = simple(relation._defineRel_('multiple'), relation);
rel.$$setValue(false);
rel._required.$$setValue(true);

Object.defineProperty(rel, '$setValue', d(function (value) {
	var old = this.__value, nu;
	if (value === undefined) nu = this._value;
	else nu = value = Boolean(value);
	if (old !== nu) {
		if (!nu) toSingular(this.obj);
		else toMultiple(this.obj);
	}
	this.$$setValue(value);
	this._signal_(value);
}));
