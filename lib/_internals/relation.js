'use strict';

var d           = require('es5-ext/lib/Object/descriptor')
  , Plain       = require('./plain')
  , isNamespace = require('./is-namespace')
  , RelSet      = require('./rel-set')

  , isArray = Array.isArray
  , getPrototypeOf = Object.getPrototypeOf

  , Relation, Constructor;

module.exports = Relation = Plain.create(function (obj, name) {
	this.obj = obj;
	this.name = name;
});

Constructor = function (obj) { this.obj = obj; };
Object.defineProperties(Relation.prototype, {
	create: d('c', function (obj) {
		// Avoid Object.create for performance reasons
		Constructor.prototype = this;
		return new Constructor(obj);
	}),
	ns: d.gs('c', function () {
		return this._ns;
	}, function (value) {
		if (value === null) {
			this._ns = null;
			return;
		}
		if (value === undefined) {
			delete this._ns;
			return;
		}
		if (!isNamespace(value)) {
			throw new TypeError(value + ' is not a namespace object');
		}
		this._ns = value;
	}),
	value: d.gs('c', function () {
		var value, ns;
		if (this._$multiple._value) {
			if (!this.hasOwnProperty('__set')) this.__set = new RelSet(this);
			return this.__set;
		}
		value = this._value;
		if ((value == null) || !(ns = this._ns)) return value;
		return ns._$normalize._value(value);
	}, function self(value) {
		var ns, validate;
		if (value === undefined) {
			if (!this.hasOwnProperty('_value')) return;
			if (this._$required._value && (getPrototypeOf(this)._value == null)) {
				throw new TypeError(value + ' is not a value');
			}
			if (this.hasOwnProperty('__set')) this.__set._clear();
			delete this._value;
			return;
		}
		if (value === null) {
			if (this._$required._value) {
				throw new TypeError(value + ' is not a value');
			}
			if (this.hasOwnProperty('__set')) this.__set._clear();
			this._value = null;
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

		if ((ns = this._ns)) (value = ns(value));
		if ((validate = this._$validate._value)) {
			value = validate.call(this, value);
		}
		this._value = value;
	})
});
