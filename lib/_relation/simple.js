// Simplified relation

'use strict';

var d      = require('es5-ext/lib/Object/descriptor')
  , extend = require('es5-ext/lib/Object/extend-properties')
  , proto  = require('../_proto').prototype

  , defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , getPrototypeOf = Object.getPrototypeOf

  , hashTypes = { object: true, 'relation-set-item': true }
  , simple;

simple = defineProperties({}, {
	$$create: d(function (obj) {
		var rel = proto.$$create.call(this, obj._id_ + ':' + this.name);
		defineProperties(rel, {
			obj: d('', obj),
			__value: d('w', this.__value),
			_update_: d(rel.__update_.bind(rel))
		});
		defineProperty(obj, '__' + this.name, d('', rel));
		this.on('update', rel._update_);
		return rel;
	}),
	__update_: d(function () {
		var nu = this._value, old = this.__value;
		if (old === nu) return;
		this.__value = nu;
		this.emit('update', nu, old);
	}),
	value: d.gs(function () {
		return this.__value;
	}, function (value) {
		var error = this.validate(value);
		if (error) throw error;
		this.$setValue(value);
	}),
	$setValue: d(function (value) {
		value = this.ns.is(value) ? value : this.ns.prototype.$create(value);
		this.$$setValue(value);
		this._signal_(value);
	}),
	$$setValue: d(function (value) {
		if (this.hasOwnProperty('_value')) {
			if (value === undefined) {
				delete this._value;
				getPrototypeOf(this).on('update', this._update_);
				if (!this.hasOwnProperty('_descriptor_')) delete this.obj[this.name];
			} else if (this._value === value) {
				return;
			} else {
				this._value = value;
			}
		} else {
			if (value === undefined) return;
			defineProperty(this, '_value', d('cw', value));
			getPrototypeOf(this).off('update', this._update_);
			if (!this.hasOwnProperty('_descriptor_')) {
				this._descriptor_.enumerable =
					hashTypes.hasOwnProperty(this.obj._type_);
				defineProperty(this.obj, this.name, this._descriptor_);
			}
		}
		this._update_();
	}),
	_validate_: d(function (data, value, validate) {
		if (value === null) {
			if (data.required) return new TypeError("Property is required");
			return null;
		}
		return validate.call(this, value, data);
	}),
	_isSet_: d(false)
});

module.exports = exports = function (parent, obj) {
	var rel;
	if (obj) {
		rel = proto.$$create.call(parent, obj._id_ + ':' + parent.name);
		defineProperties(rel, {
			obj: d('', obj),
			__value: d('w', parent.__value),
			_update_: d(simple.__update_.bind(rel))
		});
		parent.on('update', rel._update_);
		defineProperty(obj, '__' + parent.name, d('', rel));
		return extend(rel, simple);
	}
	extend(parent, simple);
	return defineProperty(parent, '_update_', d(parent.__update_.bind(parent)));
};
