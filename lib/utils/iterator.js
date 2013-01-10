'use strict';

var extend   = require('es5-ext/lib/Object/extend')
  , callable = require('es5-ext/lib/Object/valid-callable')
  , last     = require('es5-ext/lib/String/prototype/last')

  , getPrototypeOf = Object.getPrototypeOf

  , Iterator;

module.exports = Iterator = function (cb) {
	this.cb = callable(cb);
	this.done = {};
};

extend(Iterator.prototype, {
	onValue: function (value) {
		if (!value || !value._id_ || (value._type_ !== 'object')) return;
		if (last.call(value._id_) !== '#') return;
		this.onObject(value);
	},
	approveRelation: function (rel) {
		return true;
	},
	onRelation: function (rel) {
		if (!rel.hasOwnProperty('_value')) return;
		if (!this.approveRelation(rel)) return;
		this.cb(rel);
		if (rel.multiple) {
			rel._forEachItem_(this.onSetItem, this);
		} else {
			this.onValue(rel.value);
		}
	},
	onSetItem: function (item) {
		var value = item.value;
		if (value == null) return;
		this.cb(item);
		this.onValue(value);
	},
	onObject: function (obj) {
		if (this.done[obj._id_]) return;
		this.done[obj._id_] = true;
		this.cb(obj);
		obj._forEachRelation_(this.onRelation, this);
		obj._forEachReverse_(function (rel) {
			var parent;
			if (!rel._reverse._value) return;
			if (!this.approveRelation(rel)) return;
			parent = rel;
			while (parent._id_ && !parent.reverse) parent = getPrototypeOf(parent);
			if (parent.ns !== rel.ns) return;
			if (!this.approveRelation(parent)) return;
			this.onObject(rel.obj);
		}, this);
	}
});
