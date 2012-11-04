'use strict';

var d        = require('es5-ext/lib/Object/descriptor')
  , forEach  = require('es5-ext/lib/Object/for-each')
  , isObject = require('es5-ext/lib/Object/is-object')
  , isString = require('es5-ext/lib/String/is-string')
  , uuid     = require('time-uuid')
  , base     = require('./base')

  , create = Object.create, defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties

  , object, getConstructor;

getConstructor = function () {
	return function Self(properties) {
		if (isString(properties) && Self.propertyIsEnumerable(properties)) {
			return Self[properties];
		}
		if (!isObject(properties) || properties.__id) {
			return Self.validate(properties);
		}
		if (!this || (this.constructor !== Self)) return new Self(properties);

		base.transaction(function () {
			this.__create(properties);
			defineProperties(this, {
				__id:      d(uuid()),
				__created: d(base.lock),
				__ns:      d(Self)
			});
		}.bind(this));

		Self[this.__id] = this;
		return this;
	};
};

module.exports = object = base.create('object', getConstructor(), {
	validate: function (value) {
		if (!value || !value.__id || !this.propertyIsEnumerable(value.__id) ||
				(this[value.__id] !== value)) {
			throw new TypeError(value + "doesn't represent valid dbjs." +
				this.__id + " object");
		}
		return value;
	},
	normalize: function (value) {
		if (isString(value)) {
			return this.propertyIsEnumerable(value) ? this[value] : null;
		}
		if (value && value.__id && this.propertyIsEnumerable(value.__id) &&
				(this[value.__id] === value)) {
			return value;
		}
		return null;
	}
});

defineProperties(object, {
	create: d('c', function (name, properties) {
		return base.transaction(function () {
			var constructor = base.create.call(this, name, getConstructor());
			constructor.prototype = create(this.prototype);
			defineProperty(constructor.prototype, 'constructor', d(constructor));
			if (properties) {
				forEach(properties, function (value, name) {
					this.set(name, value, 'e');
				}, constructor.prototype);
			}
			return constructor;
		}.bind(this));
	})
});

defineProperties(object.prototype, {
	__create: d('c', object.__create),
	set: d('c', object.set)
});
