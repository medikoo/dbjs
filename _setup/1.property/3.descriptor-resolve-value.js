'use strict';

var d           = require('d')
  , isGetter    = require('../utils/is-getter')
  , observePass = require('../utils/observe-pass-through')

  , defineProperties = Object.defineProperties
  , getPrototypeOf = Object.getPrototypeOf;

module.exports = function (descriptor, accessCollector) {
	defineProperties(descriptor, {
		_value_: d('', undefined),
		_resolveInner_: d(function () {
			if (!this._sKey_) return;
			if (this._reverse_) return this._reverse_.get(this.object);
			if (this.nested) {
				return this.object._getObject_(this._sKey_);
			}
			return this.hasOwnProperty('_value_') ? this._value_ :
					getPrototypeOf(this)._resolveInner_();
		}),
		_resolveValueValue_: d(function () {
			if (!this._sKey_) return;
			if (this.hasOwnProperty('_value_')) return this._value_;
			return getPrototypeOf(this)._resolveInner_();
		}),
		_resolveValue_: d(function (obj, sKey) {
			var value;
			if (this._sKey_) sKey = this._sKey_;
			if (this._reverse_) return this._reverse_.get(obj);
			if (this.nested) return obj._getObject_(sKey);
			value = this._resolveValueValue_();
			if (isGetter(value)) {
				if (this.multiple) return obj._resolveDynamicMultiple_(sKey, value);
				if (this.hasOwnProperty('__dynamicValues__')) {
					if (this.__dynamicValues__[sKey]) {
						return this.__dynamicValues__[sKey].resolvedValue;
					}
				}
				value = value.call(obj, observePass);
				if (value == null) return null;
				return this._normalizeValue_(value);
			}
			if (this.multiple) return obj._getMultiple_(sKey);
			if (value == null) return value;
			return this._normalizeValue_(value);
		}),
		_resolveValueGetter_: d(function () {
			var value;
			if (this._reverse_) return null;
			if (this.nested) return null;
			value = this._resolveValueValue_();
			if (isGetter(value)) return value;
			return null;
		}),
		_resolveLastEvent_: d(function (obj, sKey) {
			var property, current, value, accessed;
			if (this._sKey_) sKey = this._sKey_;
			if (this._reverse_) return this._reverse_.getLastEvent(obj, sKey);
			if (this.nested) {
				property = this._getCurrentDescriptor_('nested');
				return property ? property._lastOwnEvent_ : null;
			}
			if (this.multiple) {
				property = this._getCurrentDescriptor_('multiple');
				return property ? property._lastOwnEvent_ : null;
			}
			current = this;
			while (!current.hasOwnProperty('_value_')) {
				current = getPrototypeOf(current);
				if (!current._sKey_) break;
				if (current._reverse_) current._reverse_.getLastEvent(obj, sKey);
				if (current.nested) {
					property = current._getCurrentDescriptor_('nested');
					return property ? property._lastOwnEvent_ : null;
				}
			}
			value = current._value_;
			if (!isGetter(value)) return current._lastOwnEvent_;
			accessCollector.emit('register', accessed = []);
			value.call(obj, observePass);
			accessCollector.emit('unregister');
			if (!accessed.length) return current._lastOwnEvent_;
			return accessed.reduce(function (event, accessed) {
				var obj = accessed[0], next;
				next = obj._getCurrentDescriptor_(accessed[1]);
				if (!next) return event;
				next = next._lastEvent_;
				if (!next) return event;
				if (!event) return next;
				return (next.stamp > event.stamp) ? next : event;
			}, null);
		}),
		_resolveLastModified_: d(function (obj, sKey) {
			var event = this._resolveLastEvent_(obj, sKey);
			return event ? event.stamp : 0;
		}),
		_hasValue_: d(function (obj) {
			if (!this._sKey_) return false;
			if (this._reverse_) return this._reverse_.has(obj);
			if (this.nested) return true;
			if (this.multiple) return true;
			return (this._resolveValueValue_(obj, this._sKey_) !== undefined);
		}),
		_hasOwnValue_: d(function (obj) {
			if (!this._sKey_) return false;
			if (this._reverse_) return this._reverse_.has(obj);
			if (this.nested) return true;
			if (this.multiple) return true;
			if (this.object !== obj) return false;
			return this.hasOwnProperty('_value_') && (this._value_ !== undefined);
		}),
		_normalizeValue_: d(function (value) {
			return this.type.normalize(value, this);
		})
	});
};
