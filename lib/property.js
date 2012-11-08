'use strict';

var getPrototypeOf = Object.getPrototypeOf

  , Constructor, Property, isProperty, isNamespace, getConstructor;

isNamespace = function (value) { return value && value.__id && !value.__ns; };

getConstructor = function () {
	return function (obj, value, name) {
		this.obj = obj;
		if (name) (this.name = name);
		this.set(value);
	};
};

Constructor = getConstructor();
module.exports = Property = getConstructor();
Property.prototype = {
	ns: null,
	isProperty: true,
	create: function (obj, value) {
		// Avoid Object.create for performance reasons
		Constructor.prototype = this;
		return new Constructor(obj, value);
	},
	set: function (value) {
		var ns, validate, proto;
		if (value == null) {
			if (this.required) throw new TypeError(value + ' is not a value');
			if (this.hasOwnProperty('ns')) delete this.ns;
			return (this.value = null);
		}
		if (isNamespace(value)) {
			this.ns = value;
		} else if (this.hasOwnProperty('ns')) {
			proto = getPrototypeOf(this);
			if (proto.ns) (value = proto.ns(value));
			if (proto.validate) (value = proto.validate.call(this, value, proto.ns));
			delete this.ns
		} else {
			if (this.ns) (value = this.ns(value));
			if (this.validate) (value = this.validate(value, this.ns));
		}
		return (this.value = value);
	},
	validateUndefinedExt: function () {
		if (this.required && (this.ns && (this.ns === this.value))) {
			throw new TypeError('undefined is not a value');
		}
	}
};

isProperty = Property.isProperty = function (value) {
	return Boolean(value && value.isProperty && value.set);
};
