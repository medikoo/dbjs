// Simplified relation

'use strict';

var d      = require('es5-ext/object/descriptor')
  , extend = require('es5-ext/object/extend-properties')
  , proto  = require('../_proto')

  , defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , getPrototypeOf = Object.getPrototypeOf
  , descriptorCreate = {
	obj: { configurable: false, enumerable: false, writable: false },
	_root_: { configurable: false, enumerable: false, writable: false },
	__value: { configurable: false, enumerable: false, writable: true },
	_update_: { configurable: true, enumerable: false, writable: true }
}, descriptor = { configurable: false, enumerable: false, writable: false }
  , descriptorCW = { configurable: true, enumerable: false, writable: true }

  , hashTypes = { object: true, prototype: true, 'relation-set-item': true }
  , simple;

simple = defineProperties({}, {
	$$create: d(function (obj) {
		var rel = proto.$$create.call(this, obj._id_ + ':' + this.name);

		descriptorCreate.obj.value = obj;
		descriptorCreate._root_.value = obj._root_;
		descriptorCreate.__value.value = this.__value;
		descriptorCreate._update_.value = rel.__update_.bind(rel);
		defineProperties(rel, descriptorCreate);

		descriptor.value = rel;
		defineProperty(obj, '__' + this.name, descriptor);

		if (!this._noChangeListener_) this.on('change', rel._update_);
		return rel;
	}),
	__update_: d(function () {
		var nu = this._value, old = this.__value;
		if (old === nu) return;
		this.__value = nu;
		this.emit('change', nu, old);
	}),
	value: d.gs(function () {
		return this.__value;
	}, function (value) {
		var error = this.validate(value);
		if (error) throw error;
		this.$setValue(value);
	}),
	$setValue: d(function (value) {
		var ns;
		if (value != null) {
			ns = this.__ns.__value;
			value = ns.is(value) ? value : ns.prototype.$create(value);
		}
		this._signal_(value);
	}),
	$$setValue: d(function (value) {
		if (this.hasOwnProperty('_value')) {
			if (value === undefined) {
				delete this._value;
				getPrototypeOf(this).on('change', this._update_);
				if (!this.hasOwnProperty('_descriptor_')) delete this.obj[this.name];
			} else if (this._value !== value) {
				this._value = value;
			} else {
				return;
			}
		} else {
			if (value === undefined) return;

			descriptorCW.value = value;
			defineProperty(this, '_value', descriptorCW);

			getPrototypeOf(this).off('change', this._update_);
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
		parent.on('change', rel._update_);
		defineProperty(obj, '__' + parent.name, d('', rel));
		return extend(rel, simple);
	}
	extend(parent, simple);
	return defineProperty(parent, '_update_', d(parent.__update_.bind(parent)));
};
