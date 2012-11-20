'use strict';

var d              = require('es5-ext/lib/Object/descriptor')
  , Plain          = require('./plain')
  , isNamespace    = require('./is-namespace')
  , RelSet         = require('./rel-set')
  , RelSetReadOnly = require('./rel-set-read-only')

  , isArray = Array.isArray
  , defineProperties = Object.defineProperties
  , getPrototypeOf = Object.getPrototypeOf

  , Relation, Constructor;

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
			if (this._$multiple._value) return new RelSetReadOnly(this._ns, value);
			return this._ns._normalize(value);
		}
		if (this._$multiple._value) {
			if (!this.hasOwnProperty('__set')) this.__set = new RelSet(this);
			return this.__set;
		}
		if (value == null) return value;
		return this._ns._normalize(value);
	}, function self(value) {
		var error;
		if ((error = this.validate(value))) throw error;
		if (value === undefined) {
			if (this.hasOwnProperty('__set')) this.__set._clear();
			delete this._value;
			return;
		}
		if (value === null) {
			if (this.hasOwnProperty('__set')) this.__set._clear();
			this._value = null;
			return;
		}
		if (typeof value === 'function') {
			if (this.hasOwnProperty('__set')) this.__set._clear();
			this._value = value;
			return;
		}

		if (this.hasOwnProperty('__set')) {
			this.__set._reset(value);
			return;
		} else if (this._$multiple._value && isArray(value)) {
			this.__set = new RelSet(this);
			this.__set._reset(value);
			return;
		}

		this._value = this._ns(value);
	}),
	validate: d('c', function (value) {
		var ns, error, errors;
		if (value === undefined) {
			if (this._$required._value && (getPrototypeOf(this)._value == null)) {
				return new TypeError(value + " is not a value");
			}
			return;
		}
		if (value === null) {
			if (this._$required._value) {
				return new TypeError(value + " is not a value");
			}
			return;
		}
		if (typeof value === 'function') return;

		ns = this._ns;
		if (this._$multiple._value && isArray(value)) {
			if (!value.length && this._$required._value) {
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
