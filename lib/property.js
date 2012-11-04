'use strict';

var getPrototypeOf = Object.getPrototypeOf

  , Constructor, Property, isProperty, isNamespace, getConstructor;

isNamespace = function (value) { return value && value.__id && !value.__ns; };

getConstructor = function () {
	return function (value, required) {
		this.required = Boolean(required);
		this.set(value);
	};
};

Constructor = getConstructor();
module.exports = Property = getConstructor();
Property.prototype = {
	ns: null,
	isProperty: true,
	create: function (value) {
		// Avoid Object.create for performance reasons
		Constructor.prototype = this;
		return new Constructor(value);
	},
	set: function (value) {
		var ns;
		if (isProperty(value)) {
			throw new TypeError("Property cannot be redefined");
		} else if (isNamespace(value)) {
			this.ns = value;
			this.value = value;
		} else if (value == null) {
			if (this.required) throw new TypeError(value + ' is not a value');
			this.value = null;
		} else if (this.hasOwnProperty('ns')) {
			ns = getPrototypeOf(this).ns;
			this.value = ns ? ns(value) : value;
			delete this.ns;
		} else {
			this.value = this.ns ? this.ns(value) : value;
		}
		return this.value;
	},
	validate: function (value) {
		if (value == null) {
			if ((value === null) || (this.ns && (this.ns === this.value))) {
				if (this.required) throw new TypeError(value + ' is not a value');
			}
		} else if (isNamespace(value)) {
			return;
		} else if (isProperty(value)) {
			throw new TypeError("Property cannot be redefined");
		} else if (this.ns) {
			this.ns(value);
		}
	}
};

isProperty = Property.isProperty = function (value) {
	return Boolean(value && value.isProperty && value.set);
};
