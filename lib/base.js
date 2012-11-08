'use strict';

var isDate        = require('es5-ext/lib/Date/is-date')
  , isFunction    = require('es5-ext/lib/Function/is-function')
  , validFunction = require('es5-ext/lib/Function/valid-function')
  , d             = require('es5-ext/lib/Object/descriptor')
  , extend        = require('es5-ext/lib/Object/extend')
  , forEach       = require('es5-ext/lib/Object/for-each')
  , isString      = require('es5-ext/lib/String/is-string')
  , startsWith    = require('es5-ext/lib/String/prototype/starts-with')
  , now           = require('time-uuid/lib/time')
  , Property      = require('./property')

  , defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , getOwnPropertyNames = Object.getOwnPropertyNames
  , getPrototypeOf = Object.getPrototypeOf
  , isProperty = Property.isProperty
  , functionRe = new RegExp('^\\s*function[\\0-\'\\)-\\uffff]*' +
		'\\(([\\0-\\(\\*-\\uffff]*)\\)\\s*\\{([\\0-\\uffff]*)\\}\\s*$')
  , nameRe = /^[a-zA-Z][0-9a-zA-Z]*$/, define, PropertyExt, opts

  , base, boolean, number, string, dateTime, regExp, functionType;

PropertyExt = function (value, ext) {
	this.value = value;
	this.ext = ext;
};
PropertyExt.prototype.__propertyExtension = true;

define = function (obj, name, value, attr) {
	var get, set, prop, ext, relName, propName;
	if (value && value.__propertyExtension) {
		ext = value.ext;
		value = value.value;
	}
	prop = new Property(obj, value, name);
	if (ext) extend(prop, ext);
	relName = '_' + name;
	propName = '_$' + name;

	defineProperty(obj, propName, d('', prop));
	defineProperty(obj, relName, d.gs('', function () {
		return this.hasOwnProperty(propName) ? this[propName] : undefined;
	}));
	defineProperty(obj, name, d.gs(attr || '', get = function () {
		var prop = this[propName];
		if (!prop.ns) return prop.value;
		if (prop.ns === prop.value) {
			return this.hasOwnProperty(propName) ? prop.value : undefined;
		}
		return (prop.value == null) ? null : prop.ns.normalize(prop.value);
	}, set = function (value) {
		if (this.hasOwnProperty(propName)) return this[propName].set(value);
		defineProperty(this, propName, d('', this[propName].create(this, value)));
		defineProperty(this, name, d.gs(attr || '', get, set));
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
			if (properties) constructor.__create(properties);
			defineProperties(constructor, {
				__id:      d(name),
				__created: d(base.lock)
			});
		});

		defineProperty(this, name, d(constructor));
		return constructor;
	}),
	__create: d('c', function (properties, attr) {
		var proto, prop, errors, error, done, iterate;
		forEach(properties, function (value, name) {
			try {
				this.set(name, value, attr);
			} catch (e) {
				if (!errors) (errors = []);
				errors.push(e);
			}
		}, this);
		proto = getPrototypeOf(this);
		done = {};
		iterate = function (name) {
			if (done[name]) return;
			done[name] = true;
			if (!startsWith.call(name, '_$') || this.hasOwnProperty(name)) return;
			prop = proto[name];
			if (!isProperty(prop) || (prop.value !== prop.ns)) return;
			try {
				prop.validateUndefinedExt();
			} catch (e) {
				if (!errors) (errors = []);
				errors.push(e);
			}
		};
		while (proto !== Object.prototype) {
			getOwnPropertyNames(proto).forEach(iterate, this);
			proto = getPrototypeOf(proto);
		}
		if (errors) {
			error = new TypeError("Could not define properties");
			error.subErrors = errors;
			throw error;
		}
	}),
	set: d('c', function (name, value, attr) {
		if (!nameRe.test(name)) {
			throw new Error("'" + name + "' is not valid property name");
		}

		if ((name in this) && (('_$' + name) in this)) { //jslint: skip
			// Defined value, set directly
			if (value && value.__propertyExtension) {
				this[name] = value.value;
				if (value.ext) extend(this['_$' + name], value.ext);
				return this[name];
			} else {
				return (this[name] = value);
			}
		}

		return define(this, name, value, attr);
	}),
	rel: d('c', function (data) {
		return new PropertyExt(this, data);
	}),
	required: d.gs('c', function () {
		return new PropertyExt(this, { required: true });
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

// function type (we need it before it can be created)
functionType = defineProperties(function self(value) {
	return self.validate(value);
}, {
	__id:      d('function'),
	__created: d(0)
});
functionType.__proto__ = base;
opts = { required: true };
define(functionType, 'validate', new PropertyExt(validFunction, opts));
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
}, opts));
define(base, 'validate', new PropertyExt(functionType, opts));
define(base, 'normalize', new PropertyExt(functionType, opts));
defineProperty(base, 'function', d(functionType));
functionType._validate.__proto__ = base._validate;

boolean      = require('./boolean');
number       = require('./number');
regExp       = require('./reg-exp');
string       = require('./string');
dateTime     = require('./date-time');
