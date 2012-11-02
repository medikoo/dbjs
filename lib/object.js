'use strict';

var d        = require('es5-ext/lib/Object/descriptor')
  , forEach  = require('es5-ext/lib/Object/for-each')
  , isObject = require('es5-ext/lib/Object/is-object')
  , isString = require('es5-ext/lib/String/is-string')
  , uuid     = require('time-uuid')
  , base     = require('./base')

  , defineProperties = Object.defineProperties

  , object, getConstructor;

getConstructor = function () {
	return function Self(data) {
		var errors, error;
		if (isString(data) && Self.propertyIsEnumerable(data)) return Self[data];
		if (!isObject(data) || data.__id) return Self.validate(data);
		if (!this || (this.constructor !== Self)) return new Self(data);

		base.transaction(function () {
			defineProperties(this, {
				__id:      d(uuid()),
				__created: d(base.lock),
				__ns:      d(Self)
			});

			// Define by predefined schema
			forEach(Self.prototype, function (value, name) {
				if (value.__id && value.__isNS) {
					try {
						value._defineProperty(this, name, data[name], 'e');
					} catch (e) {
						if (!errors) (errors = []);
						errors.push(e);
					}
				}
			}, this);
			if (errors) {
				error = new TypeError("Could not define properties");
				error.subErrors = errors;
				throw error;
			}
			Self._setProperties(this, data, 'e');
		}.bind(this));

		Self[this.__id] = this;
		return this;
	};
};

module.exports = object = base.create('object', getConstructor());

defineProperties(object, {
	create: d(function (name, properties) {
		return base.transaction(function () {
			var constructor = base.create.call(this, name, getConstructor());
			constructor.prototype.__proto__ = this.prototype;
			if (properties) {
				this._setProperties(constructor.prototype, properties, 'e');
			}
			return constructor;
		}.bind(this));
	}),
	validate: d(function (value) {
		if (value == null) return null;
		if (!value || !value.__id || !this.propertyIsEnumerable(value.__id) ||
				(this[value.__id] !== value)) {
			throw new TypeError(value + "doesn't represent valid dbjs." +
				this.__id + " object");
		}
		return value;
	}),
	normalize: d(function (value) {
		if (value == null) return value;
		if (isString(value)) {
			return this.propertyIsEnumerable(value) ? this[value] : null;
		}
		if (value.__id && this.propertyIsEnumerable(value.__id) &&
				(this[value.__id] === value)) {
			return value;
		}
		return null;
	})
});
