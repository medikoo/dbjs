'use strict';

var d        = require('es5-ext/lib/Object/descriptor')
  , isString = require('es5-ext/lib/String/is-string')
  , uuid     = require('time-uuid')
  , base     = require('./base')

  , create = Object.create, defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , __create = base.__create

  , object, getConstructor;

getConstructor = function () {
	return function Self(properties) {
		if ((properties != null) && properties.__id) {
			return Self.validate(properties);
		}
		if (!this || (this.constructor !== Self)) return new Self(properties);
		base.transaction(function () {
			Self.construct(this, properties);
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
	construct: base.function.rel({
		default: function (obj, props) { __create.call(obj, props, false, 'e'); },
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

defineProperties(object, {
	create: d('c', function (name, objProps, nsProps) {
		return base.transaction(function () {
			var constructor = base.create.call(this, name, getConstructor(), nsProps);
			constructor.prototype = create(this.prototype);
			defineProperty(constructor.prototype, 'constructor', d(constructor));
			if (objProps) __create.call(constructor.prototype, objProps, true, 'e');
			defineProperty(constructor.prototype, '__id', d(name + '#'));
			return constructor;
		}.bind(this));
	})
});

defineProperties(object.prototype, {
	__id: d('object#')
});
base.set.call(object.prototype, 'set', base.function, '');
object.prototype.set = base.set;
