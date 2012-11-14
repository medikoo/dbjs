'use strict';

var d           = require('es5-ext/lib/Object/descriptor')
  , base        = require('./base')
  , isNamespace = require('./_internals/is-namespace')

  , getPrototypeOf = Object.getPrototypeOf

  , Relation, Constructor;

module.exports = Relation = base.create('Relation', function (obj, name) {
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
			return (this._ns = null);
		}
		if (value === undefined) {
			delete this._ns;
			return;
		}
		if (!isNamespace(value)) {
			throw new TypeError(value + ' is not a namespace object');
		}
		return (this._ns = value);
	}),
	resolved: d.gs('c', function () {
		return this.hasOwnProperty('_resolved') ? this._resolved : true;
	}, function (value) {
		this._resolved = Boolean(value);
	}),
	value: d.gs('c', function () {
		var value = this._value, ns = this._ns;
		if ((value == null) || !ns || (ns._$async._value && !this.resolved)) {
			return value;
		}
		return ns._$normalize._value(value);
	}, function self(value) {
		var ns;
		if (value === null) {
			if (this.required) throw new TypeError(value + ' is not a value');
			return (this._value = null);
		}
		if (value === undefined) {
			if (this.required && (getPrototypeOf(this)._value == null)) {
				throw new TypeError(value + ' is not a value');
			}
			delete this._value;
			return;
		}

		ns = this._ns;
		if (ns) (value = ns(value));
		if (this.validate) (value = this.validate(value));

		if (value && ns && ns._$async._value) {
			this.resolved = false;
			try {
				value.end(function (value) {
					this.resolved = true;
					this._value = value;
				}.bind(this));
			} catch (e) {
				this.resolved = true;
				throw e;
			}
		}
		return (this._value = value);
	})
});
