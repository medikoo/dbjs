'use strict';

var d              = require('es5-ext/lib/Object/descriptor')
  , Plain          = require('./plain')
  , isNamespace    = require('./is-namespace')
  , RelSet         = require('./rel-set')
  , RelSetReadOnly = require('./rel-set-read-only')

  , isArray = Array.isArray
  , defineProperties = Object.defineProperties
  , getPrototypeOf = Object.getPrototypeOf

  , Relation, Constructor, getBoolGetSet;

getBoolGetSet = function (name) {
	name = '_' + name;
	return d.gs('c', function () { return this[name]; }, function (value) {
		this[name] = Boolean(value && value.valueOf());
	});
};

module.exports = Relation = Plain.create(function (obj, name) {
	this.obj = obj;
	this.name = name;
});

Constructor = function (obj) { this.obj = obj; };
defineProperties(Relation.prototype, {
	create: d('c', function (obj) {
		// Avoid Object.create for performance reasons
		Constructor.prototype = this;
		return new Constructor(obj);
	}),
	_required: d('c', false),
	required: getBoolGetSet('required'),
	_multiple: d('c', false),
	multiple: getBoolGetSet('multiple'),
	_ns: d('c', defineProperties(function (value) { return value; }, {
		_normalize: d('c', function (value) { return value; }),
		_validate: d('c', function () {})
	})),
	ns: d.gs('c', function () {
		return this._ns;
	}, function (value) {
		if (value === null) {
			this._ns = Relation.prototype._ns;
			return;
		}
		if (value === undefined) {
			delete this._ns;
			return;
		}
		if (!isNamespace(value)) {
			throw new TypeError(value + " is not a namespace object");
		}
		this._ns = value;
	}),
	value: d.gs('c', function () {
		var value = this._value;
		if (typeof value === 'function') {
			value = value.call(this.obj);
			if (this._multiple) return new RelSetReadOnly(this._ns, value);
			return this._ns._normalize(value);
		}
		if (this._multiple) {
			if (!this.hasOwnProperty('__set')) this.__set = new RelSet(this);
			return this.__set;
		}
		if (value == null) return value;
		return this._ns._normalize(value);
	}, function self(value) {
		var error;
		if ((error = this.validate(value))) throw error;

		if (this.hasOwnProperty('__set')) {
			this.__set._reset(value);
			return;
		} else if (this._multiple && isArray(value)) {
			this.__set = new RelSet(this);
			this.__set._reset(value);
			return;
		}

		if (value === undefined) {
			delete this._value;
			return;
		}
		if (value === null) {
			this._value = null;
			return;
		}
		if (typeof value === 'function') {
			this._value = value;
			return;
		}

		this._value = this._ns(value);
	}),
	validate: d('c', function (value) {
		var ns, error, errors;
		if (value === undefined) {
			if (this._required && (getPrototypeOf(this)._value == null)) {
				return new TypeError(value + " is not a value");
			}
			return;
		}
		if (value === null) {
			if (this._required) return new TypeError(value + " is not a value");
			return;
		}
		if (typeof value === 'function') return;

		ns = this._ns;
		if (this._multiple && isArray(value)) {
			if (!value.length && this._required) {
				return new TypeError("Set can't be empty");
			}
			value.forEach(function (value) {
				if (value == null) {
					if (!errors) errors = [];
					errors.push(new TypeError(value + " is not a value"));
					return;
				}
				if ((error = ns._validate(value))) {
					if (!errors) errors = [];
					errors.push(error);
				}
			});
			return errors;
		}
		return ns._validate(value);
	})
});
