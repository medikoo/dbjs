'use strict';

var isDate        = require('es5-ext/lib/Date/is-date')
  , isFunction    = require('es5-ext/lib/Function/is-function')
  , validFunction = require('es5-ext/lib/Function/valid-function')
  , copy          = require('es5-ext/lib/Object/copy')
  , d             = require('es5-ext/lib/Object/descriptor')
  , extend        = require('es5-ext/lib/Object/extend')
  , forEach       = require('es5-ext/lib/Object/for-each')
  , validValue    = require('es5-ext/lib/Object/valid-value')
  , isString      = require('es5-ext/lib/String/is-string')
  , startsWith    = require('es5-ext/lib/String/prototype/starts-with')
  , now           = require('time-uuid/lib/time')
  , Property      = require('./_property')

  , defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , getOwnPropertyNames = Object.getOwnPropertyNames
  , getPrototypeOf = Object.getPrototypeOf
  , isProperty = Property.isProperty
  , functionRe = new RegExp('^\\s*function[\\0-\'\\)-\\uffff]*' +
		'\\(([\\0-\\(\\*-\\uffff]*)\\)\\s*\\{([\\0-\\uffff]*)\\}\\s*$')
  , nameRe = /^[a-zA-Z][0-9a-zA-Z]*$/

  , define, PropertyExt, requiredOpts, isNamespace, base, boolean, number
  , string, dateTime, regExp, functionType, boolNormalize;

PropertyExt = function (value, ns, ext) {
	this.value = value;
	this.ns = ns;
	this.ext = ext;
};
PropertyExt.prototype.__propertyExtension = true;

requiredOpts = { required: true };

isNamespace = function (value) { return value && value.__id && !value.__ns; };

define = function (obj, name, value, attr) {
	var ns, get, set, prop, ext, propName;
	if (value && value.__propertyExtension) {
		ns = value.ns;
		ext = value.ext;
		value = value.value;
	} else if (isNamespace(value)) {
		ns = value;
		value = null;
	}
	prop = new Property(obj, value, ns, name);
	if (ext) extend(prop, ext);
	propName = '_$' + name;

	defineProperty(obj, propName, d('', prop));
	defineProperty(obj, '_' + name, d.gs('', function () {
		return this.hasOwnProperty(propName) ? this[propName] : undefined;
	}));
	defineProperty(obj, name, d.gs(attr, get = function () {
		var prop = this[propName], value = prop.value, ns = prop.ns;
		if ((value == null) || !ns || (ns._$async.value && !prop.resolved)) {
			return value;
		}
		return ns._$normalize.value(value);
	}, set = function (value) {
		var ns, ext;
		if (value && value.__propertyExtension) {
			ns = value.ns;
			ext = value.ext;
			value = value.value;
		} else if (isNamespace(value)) {
			ns = value;
			value = null;
		}
		if (this.hasOwnProperty(propName)) {
			this[propName].set(value, ns);
		} else {
			defineProperty(this, propName,
				d('', this[propName].create(this, value, ns)));
			defineProperty(this, name, d.gs(attr, get, set));
		}
		if (ext) extend(this[propName], ext);
		return this[propName].value;
	}));
	return prop.value;
};

module.exports = base = defineProperties(function self(value) {
	return self.validate(value);
}, {
	__id: d('base'),
	lock: d(null),
	create: d('c', function (name, constructor, properties) {
		name = String(name);
		if (!nameRe.test(name)) {
			throw new Error(name + "is not valid namespace name");
		}

		if ((properties == null) && !isFunction(constructor)) {
			properties = constructor;
			constructor = eval('(' + String(this) + ')');
		}
		constructor.__proto__ = this;

		base.transaction(function () {
			constructor.__create(properties, false, '');
			defineProperties(constructor, {
				__id:      d(name),
				__created: d(base.lock)
			});
		});

		defineProperty(this, name, d(constructor));
		return constructor;
	}),
	__create: d('c', function (properties, isSchema, attr) {
		var proto, prop, errors, error, done, iterate;
		if (properties) {
			forEach(properties, function (value, name) {
				try {
					this.set(name, value, attr);
				} catch (e) {
					if (!errors) (errors = {});
					errors[name] = e;
				}
			}, this);
		}
		if (!isSchema) {
			proto = getPrototypeOf(this);
			done = {};
			iterate = function (name) {
				if (done[name]) return;
				done[name] = true;
				if (!startsWith.call(name, '_$') || this.hasOwnProperty(name) ||
						(errors && errors[name.slice(2)])) {
					return;
				}
				prop = proto[name];
				if (!isProperty(prop)) return;
				try {
					prop.validateUndefinedExt();
				} catch (e) {
					if (!errors) (errors = {});
					errors[name.slice(2)] = e;
				}
			};
			while (proto !== Object.prototype) {
				getOwnPropertyNames(proto).forEach(iterate, this);
				proto = getPrototypeOf(proto);
			}
		}
		if (errors) {
			error = new TypeError("Could not define properties");
			error.subErrors = errors;
			throw error;
		}
	}),
	rel: d('c', function (data) {
		var value;
		validValue(data);
		if (data.default) {
			data = copy(data);
			value = data.default;
			delete data.default;
		}
		return new PropertyExt(value, this, data);
	}),
	required: d.gs('c', function () {
		return new PropertyExt(null, this, requiredOpts);
	}),
	transaction: d('c', function (fn) {
		if (base.lock) return fn();
		base.lock = now();
		try {
			return fn();
		} finally {
			base.lock = null;
		}
	}),
	serialize: d('c', function (value) {
		var type;
		if (value === null) return null;
		type = typeof value;
		if (type === 'object') {
			return isDate(value) ? value.toISOString() : String(value);
		} else if (type === 'function') {
			return String(value);
		} else {
			return value;
		}
	})
});

// Function type (we need to define it low-level)
functionType = defineProperties(function self(value) {
	return self.validate(value);
}, {
	__id:      d('function'),
	__created: d(0)
});
functionType.__proto__ = base;
define(functionType, 'validate',
	new PropertyExt(validFunction, null, requiredOpts), '');
define(functionType, 'normalize', new PropertyExt(function (value) {
	var match;
	if (isFunction(value)) {
		return value;
	} else if (isString(value)) {
		match = value.match(functionRe);
		if (match) {
			try {
				return new Function(match[1], match[2]);
			} catch (e) {}
		}
	}
	return null;
}, null, requiredOpts), '');
defineProperty(base, 'function', d(functionType));

// Define function properties on base
define(base, 'validate', new PropertyExt(null, functionType, requiredOpts), '');
define(base, 'normalize', new PropertyExt(null, functionType, requiredOpts),
	'');
define(base, 'set', new PropertyExt(function (name, value, attr) {
	if (!nameRe.test(name)) {
		throw new Error("'" + name + "' is not valid property name");
	}

	if ((name in this) && (('_$' + name) in this)) { //jslint: skip
		// Defined value, set directly
		return (this[name] = value);
	}

	return define(this, name, value, (attr == null) ? 'ce' : attr);
}, functionType, requiredOpts), '');

// Boolean type (we need to define it low-level)
boolean = defineProperties(function self(value) {
	return self.validate(value);
}, {
	__id:      d('boolean'),
	__created: d(0)
});
boolean.__proto__ = base;
boolNormalize = function (value) { return Boolean(value && value.valueOf()); };
boolean.validate = boolNormalize;
boolean.normalize = boolNormalize;
defineProperty(base, 'boolean', d(boolean));

// Define boolean properties on base
define(base, 'async', new PropertyExt(null, boolean, requiredOpts), '');
base.async = false;

// Other types can be defined by API
number = require('./number');
regExp = require('./reg-exp');
string = require('./string');
dateTime = require('./date-time');
