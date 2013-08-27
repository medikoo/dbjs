'use strict';

var d       = require('es5-ext/object/descriptor')
  , forEach = require('es5-ext/object/for-each')
  , memoize = require('memoizee/lib/regular')

  , defineProperty = Object.defineProperty
  , getItems;

getItems = exports.getItems = memoize(function (rel) {
	var items = {};
	// If underlying relation is dynamic (function) not configured with triggers,
	// it will not be recognized as set and rel.forEach will throw.
	if (rel._isSet_) {
		rel.forEach(function self(value, i1, i2, i3, key) { items[key] = value; });
	}
	defineProperty(items, 'ns', d(rel.__ns.__value));
	return items;
});

exports.getSets = function (rel, doSnapshot) {
	var points = [];
	if (!rel.obj.hasOwnProperty('_children_')) return points;
	rel.obj._children_.forEach(function self(child) {
		if (child.hasOwnProperty('_value')) return;
		if ((child.__multiple !== rel) &&
				child.__multiple.hasOwnProperty('_value')) {
			if (child.__multiple.__value) {
				points.push(child);
				if (doSnapshot) points.push(getItems(this));
			}
			return;
		}
		if (child.hasOwnProperty('_children_')) {
			child._children_.forEach(self, child);
		}
	}, rel.obj);
	if (doSnapshot) getItems.clearAll();
	return points;
};

exports.emitSet = function (rel, items, event) {
	var ns = rel.__ns.__value;
	forEach(items, function self(value, key) {
		if (this.hasOwnProperty(key)) {
			if (this[key]._value == null) this[key]._update_();
			return;
		}
		if ((ns !== items.ns) && (ns.normalize(value) == null)) return;
		this.emit(event, value, null, key);
		if (!this.hasOwnProperty('_children_')) return;
		this._children_.forEach(function (child) {
			if (!child.__multiple.__value) return;
			if (child.hasOwnProperty('_value')) return;
			ns = child.__ns.__value;
			self.call(child, value, key);
		});
	}, rel);
};
