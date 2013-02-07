'use strict';

var d          = require('es5-ext/lib/Object/descriptor')
  , relation   = require('../')
  , setEmitter = require('../set-emitter')
  , simple     = require('../simple')
  , serialize  = require('../../utils/serialize')

  , getPrototypeOf = Object.getPrototypeOf
  , update = function (obj) { obj._update_(false); }
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
			(rel.__ns.__value.normalize(rel._value) != null)) {
		value = rel._value;
		key = serialize(value);
		if (!key) return;
		rel._signal_(null);
		item = rel._getItem_(key, value);
		after.push(item._signal_.bind(item, true));
	}
};

rel = simple(relation._defineRel_('multiple'), relation);
rel.$$setValue(false);
rel._required.$$setValue(true);

Object.defineProperties(rel, {
	_noChangeListener_: d(true),
	__update_: d(function () {
		var nu = this._value, old = this.__value, sets, rel, set;
		if (old === nu) return;
		// gather all change points
		sets = setEmitter.getSets(this, !nu);
		this.__value = nu;
		this.emit('change', nu, old);
		this._propagate_(this.obj);
		while ((rel = sets.shift())) {
			if (nu) set = setEmitter.getItems(getPrototypeOf(rel));
			else set = sets.shift();
			setEmitter.emitSet(rel, set, nu ? 'add' : 'delete');
		}
		setEmitter.getItems.clearAll();
	}),
	_propagate_: d(function (rel) {
		if (rel.__multiple !== this) {
			if (rel.__multiple.hasOwnProperty('_value')) return;
			rel.__multiple.__value = this.__value;
			rel.__multiple.emit('change', this.__value, !this.__value);
		}
		if (rel.__multiple.__value) rel._forEachItem_(update);
		else rel._update_();
		if (rel.hasOwnProperty('_children_')) {
			rel._children_.forEach(this._propagate_, this);
		}
	}),
	$setValue: d(function (value) {
		var old = this.__value, nu, after, fn;
		if (value === undefined) nu = this._value;
		else nu = value = Boolean(value);
		if (old !== nu) {
			if (!nu) toSingular(this.obj, after = []);
			else toMultiple(this.obj, after = []);
		}
		this._signal_(value);
		if (after) while ((fn = after.shift())) fn();
	})
});
