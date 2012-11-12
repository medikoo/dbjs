'use strict';

var isFunction = require('es5-ext/lib/Function/is-function')
  , d          = require('es5-ext/lib/Object/descriptor')
  , isString   = require('es5-ext/lib/String/is-string')
  , uuid       = require('time-uuid')
  , Base       = require('./base')

  , defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties

  , ObjectType, getConstructor;

getConstructor = function () {
	return function Self(properties) {
		if ((properties != null) && properties.__id) {
			return Self.validate(properties);
		}
		if (!this || (this.constructor !== Self)) return new Self(properties);

		Self.construct(this, properties);
		defineProperties(this, {
			__id:      d(uuid()),
			__ns:      d(Self)
		});

		Self[this.__id] = this;
	};
};

module.exports = ObjectType = Base.create('object', getConstructor(), {
	construct: Base.function.rel({
		value: function (obj, props) {
			if (props) {
				obj.setMany(props);
			}
		},
		required: true
	}),
	validate: function (value) {
		var id;
		id = value && value.__id;
		if (id && this.propertyIsEnumerable(id) && (this[id] === value)) {
			return value;
		}
		throw new TypeError(value + " doesn't represent valid dbjs." + this.__id +
			" object");
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

defineProperty(ObjectType, 'create',
	d('c', function (name, constructor, objProps, nsProps) {
		var construct;
		if (!isFunction(constructor)) {
			nsProps = objProps;
			objProps = constructor;
		} else {
			construct = constructor;
		}
		constructor = Base.create.call(this, name, getConstructor(), nsProps,
			objProps);
		if (construct) constructor.construct = construct;
		return constructor;
	}));
