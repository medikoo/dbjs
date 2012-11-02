'use strict';

var isBoolean  = require('es5-ext/lib/Boolean/is-boolean')
  , isDate     = require('es5-ext/lib/Date/is-date')
  , i          = require('es5-ext/lib/Function/i')
  , isFunction = require('es5-ext/lib/Function/is-function')
  , d          = require('es5-ext/lib/Object/descriptor')
  , extend     = require('es5-ext/lib/Object/extend')
  , forEach    = require('es5-ext/lib/Object/for-each')
  , isObject   = require('es5-ext/lib/Object/is-object')
  , isRegExp   = require('es5-ext/lib/RegExp/is-reg-exp')
  , isNumber   = require('es5-ext/lib/Number/is-number')
  , now        = require('time-uuid/lib/time')

  , defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , nameRe = /^[a-zA-Z][0-9a-zA-Z]*$/, base, Property

  , boolean, number, string, dateTime, regExp, functionType, schema;

module.exports = base = extend(function self(value) {
	return self.validate(value);
}, {
	__id: 'base',
	__isNS: true,
	lock: null,
	create: function (name, constructor, properties) {
		name = String(name);
		if (!nameRe.test(name)) throw new Error("Invalid namespace name");
		if (this.hasOwnProperty(name)) throw new Error("Namespace already exists");

		if ((properties == null) && !isFunction(constructor)) {
			properties = constructor;
			constructor = eval('(' + String(this) + ')');
		}
		constructor.__proto__ = this;

		base.transaction(function () {
			defineProperties(constructor, {
				__id:      d(name),
				__created: d(base.lock)
			});
			if (properties) this._setProperties(constructor, properties, '');
		}.bind(this));

		defineProperty(this, name, d(constructor));
		return constructor;
	},
	transaction: function (fn) {
		if (base.lock) return fn();
		base.lock = now();
		try {
			return fn();
		} finally {
			base.lock = null;
		}
	},
	_defineProperty: function (obj, name, value, attr) {
		var property = new Property(this, value);
		defineProperty(obj, '_' + name, d('', property));
		defineProperty(obj, name, d.gs(attr, function () {
			return property.ns.normalize(property.value);
		}, function (value) {
			return (property.value = property.ns(value));
		}));
	},
	_setProperties: function (obj, properties, attr) {
		forEach(properties, function (value, name) {
			var ns, type;
			if (!nameRe.test(name)) {
				throw new Error("Invalid property name: '" + name + "'");
			}
			// Ignore already defined properties
			if (obj.hasOwnProperty(name)) return;

			// Detect base namespace
			if (value == null) {
				ns = boolean;
			} else if (isObject(value)) {
				if        (value.__ns)        ns = value.__ns;   //jslint: skip
				  else if (value.__id)        ns = schema;       //jslint: skip
				  else if (isDate(value))     ns = dateTime;     //jslint: skip
				  else if (isFunction(value)) ns = functionType;
				  else if (isRegExp(value))   ns = regExp;       //jslint: skip
				  else if (isNumber(value))   ns = number;       //jslint: skip
				  else if (isBoolean(value))  ns = boolean;      //jslint: skip
				  else                        ns = string;       //jslint: skip
			} else {
				type = typeof value;
				if        (type === 'boolean') ns = boolean;     //jslint: skip
				  else if (type === 'number')  ns = number;      //jslint: skip
				  else                         ns = string;      //jslint: skip
			}
			ns._defineProperty(obj, name, value, attr);
		});
	},
	validate: function (value) { return this.normalize(value); },
	serialize: function (value) {
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
	},
	normalize: i
});

Property = require('./property');

boolean      = require('./boolean');
string       = require('./string');
number       = require('./number');
functionType = require('./function');
dateTime     = require('./date-time');
regExp       = require('./reg-exp');
schema       = require('./schema');
