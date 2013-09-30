// NS property, special one, the only that is not backed by namespace

'use strict';

var d        = require('d/d')
  , proto    = require('../../_proto')
  , relation = require('../')
  , simple   = require('../simple')

  , getPrototypeOf = Object.getPrototypeOf
  , update = function (obj) { obj._update_(); }
  , rel, validate, descriptor;

descriptor = d.gs('c', function () {
	if (!this.hasOwnProperty('__ns')) this._fillRelationChain_('__ns');
	return this.__ns.value;
}, function (value) {
	if (!this.hasOwnProperty('__ns')) this._fillRelationChain_('__ns');
	this.__ns.value = value;
});

rel = simple(proto._defineRel_('ns'), relation);
Object.defineProperties(rel, {
	_descriptor_: d('c', descriptor),
	_noChangeListener_: d(true),
	__update_: d(function () {
		var nu = this._value, old = this.__value;
		if (old === nu) return;
		this.__value = nu;
		this.emit('change', nu, old);
		this._propagate_(this.obj, old);
		if (this.hasOwnProperty('_value') && !this.obj.hasOwnProperty('_value') &&
				this.obj._isSet_) {
			this._propagateParentItems_(nu, old);
		}
	}),
	_propagateParentItems_: d(function (nu, old) {
		var parent = getPrototypeOf(this.obj);
		if (parent._type_ !== 'relation') return;
		if (!parent.__multiple.__value) return;
		parent.forEach(function (value, item, proto, index, key) {
			var nuValue, oldValue, event;
			if (this.obj.hasOwnProperty(key)) return;
			nuValue = (nu.normalize(value) == null);
			oldValue = (old.normalize(value) == null);
			if (nuValue === oldValue) return;
			event = nuValue ? 'add' : 'delete';
			this.obj.emit(event, value, null, key);
			if (!this.obj.hasOwnProperty('_children_')) return;
			this.obj._children_.forEach(function self(child) {
				if ((child.__ns !== this) && (child.__ns.hasOwnProperty('_value'))) {
					return;
				}
				if (child.hasOwnProperty('_value')) return;
				if (!child.__multiple.__value) return;
				if (child.hasOwnProperty(key)) return;
				child.emit(event, value, null, key);
				if (child.hasOwnProperty('_children_')) {
					child._children_.forEach(self, this);
				}
			}, this);
		}, this);
	}),
	_propagate_: d(function (rel, old) {
		if (rel.__ns !== this) {
			if (rel.__ns.hasOwnProperty('_value')) return;
			rel.__ns.__value = this.__value;
			rel.__ns.emit('change', this.__value, old);
		}
		if (rel.__multiple.__value) rel._forEachItem_(update);
		else rel._update_();
		if (rel.hasOwnProperty('_children_')) {
			rel._children_.forEach(function (child) {
				this._propagate_(child, old);
			}, this);
		}
	}),
	$setValue: d(function (value) {
		if (value === null) value = relation.__ns.__value;
		this._signal_(value);
	}),
	validateValue: d(validate = function (value) {
		if (!value || (typeof value !== 'function') ||
				(value._type_ !== 'namespace')) {
			return new TypeError(value + ' is not valid namespace');
		}
		return null;
	}),
	validateCreateValue: d(validate)
});
Object.defineProperty(relation, 'ns', descriptor);
