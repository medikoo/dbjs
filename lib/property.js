'use strict';

var Constructor, Property, getConstructor;

getConstructor = function () {
	return function (obj, value, ns, name) {
		this.obj = obj;
		if (name) (this.name = name);
		this.set(value, ns);
	};
};

Constructor = getConstructor();
module.exports = Property = getConstructor();
Property.prototype = {
	ns: null,
	isProperty: true,
	create: function (obj, value, ns) {
		// Avoid Object.create for performance reasons
		Constructor.prototype = this;
		return new Constructor(obj, value, ns);
	},
	set: function (value, ns) {
		if (ns) (this.ns = ns);
			else if (ns === null) delete this.ns;

		if (this.hasOwnProperty('ns')) {
			value = (value == null) ? undefined : this.ns(value);
		} else {
			if (value == null) {
				if (this.required) throw new TypeError(value + ' is not a value');
				value = null;
			} else {
				if (this.ns) (value = this.ns(value));
				if (this.validate) (value = this.validate(value, this.ns));
			}
		}
		return (this.value = value);
	},
	validateUndefinedExt: function () {
		if (this.required && (this.value == null)) {
			throw new TypeError('undefined is not a value');
		}
	}
};

Property.isProperty = function (value) {
	return Boolean(value && value.isProperty && value.set);
};
