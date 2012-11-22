'use strict';

var d              = require('es5-ext/lib/Object/descriptor')
  , Plain          = require('./plain')
  , isNamespace    = require('./is-namespace')
  , nameRe         = require('./name-re')
  , RelSetReadOnly = require('./rel-set-read-only')
  , reverse        = require('./rel-reverse')
  , UniqueIndex    = require('./unique-index')
  , serialize      = require('./serialize')

  , isArray = Array.isArray
  , defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , getPrototypeOf = Object.getPrototypeOf

  , Relation, Constructor, getBoolGetSet;

getBoolGetSet = function (name) {
	name = '_' + name;
	return d.gs(function () { return this[name]; }, function (value) {
		defineProperty(this, name, d('c', Boolean(value && value.valueOf())));
	});
};

module.exports = Relation = Plain.create(function (obj, name, descriptor) {
	defineProperties(this, {
		obj: d('', obj),
		name: d.gs('', function () { return name; }),
		__descriptor: d('', descriptor)
	});
});
require('./rel-set');

Constructor = function (obj) { defineProperty(this, 'obj', d('', obj)); };
defineProperties(Relation.prototype, {
	__create: d('c', function (obj) {
		var rel;
		// Avoid Object.create for performance reasons
		Constructor.prototype = this;
		rel = new Constructor(obj);
		if (!this.hasOwnProperty('__children')) {
			defineProperty(this, '__children', d('', []));
		}
		this.__children.push(rel);
		return rel;
	}),
	_required: d(false),
	required: getBoolGetSet('required'),
	_multiple: d(false),
	multiple: getBoolGetSet('multiple'),
	_unique: d(false),
	unique: d.gs(function () { return this._unique; }, function (value) {
		if (value) {
			if (this._unique) {
				defineProperty(this, '_unique', d('c', true));
				return;
			}
			defineProperty(this, '_unique', d('c', true));
			defineProperty(this, '__uniqIndex', d('c', new UniqueIndex(this)));
		} else {
			if (!this._unique) return;
			if (!this.hasOwnProperty('_unique')) {
				throw new Error("Cannot override unique on extended namespace.");
			}
			delete this._unique;
			delete this.__uniqIndex;
			if (this.hasOwnProperty('__children')) {
				this.__children.forEach(function self(child) {
					if (child._unique) {
						defineProperty(child, '__uniqIndex',
							d('c', new UniqueIndex(child)));
					} else if (child.hasOwnProperty('__children')) {
						child.__children.forEach(self);
					}
				});
			}
		}
	}),
	_reverse: d(null),
	reverse: d.gs(function () {
		return this.hasOwnProperty('_reverse') ? this._reverse : null;
	}, function (name) {
		if (!name) {
			if (this.hasOwnProperty('_reverse')) reverse.unset(this, this._reverse);
			delete this._reverse;
			return;
		}
		if (name === true) {
			name = this.obj.ns.__id;
			name = name[0].toLowerCase() + name.slice(1);
		}
		if (name === this.reverse) return;
		if (!nameRe.test(name)) throw new Error(name + " is not a valid name");
		if (name in this._ns) throw new TypeError(name + " is already taken");
		if (this.hasOwnProperty('_reverse')) reverse.unset(this, this._reverse);
		reverse.set(this, name);
		defineProperty(this, '_reverse', d('c', name));
	}),
	_ns: d(defineProperties(function (value) { return value; }, {
		_normalize: d(function (value) { return value; }),
		_validate: d(function () {}),
		__serialize: d(serialize),
		coerce: d(function (value) { return value; })
	})),
	ns: d.gs(function () {
		return this._ns;
	}, function (value) {
		var old = this._ns;
		if (value === null) {
			defineProperty(this, '_ns', d('c', Relation.prototype._ns));
		} else if (value === undefined) {
			delete this._ns;
		} else if (!isNamespace(value)) {
			throw new TypeError(value + " is not a namespace object");
		} else {
			defineProperty(this, '_ns', d('c', value));
		}
		if (old === this._ns) return;
		if (this.hasOwnProperty('_reverse')) {
			reverse.unset(this, this._reverse);
			if (this._reverse in this._ns) return;
			reverse.set(this, this._reverse);
		}
		if (this._unique) this.__uniqIndex.updateNs(this, old);
	}),
	__onOld: d('c', function (value) {
		if (value === undefined) {
			if (!this.hasOwnProperty('__descriptor')) {
				defineProperty(this.obj, this.name, this.__descriptor);
			}
		}
		if (this._unique) this.__uniqIndex.remove(this, value);
		if (value && value.__id && value.ns) reverse.remove(this, value);
	}),
	__onNew: d('c', function (value) {
		if (value === undefined) {
			if (!this.hasOwnProperty('__descriptor')) delete this.obj[this.name];
		}
		if (this._unique) this.__uniqIndex.add(this, value);
		if (value && value.__id && value.ns) reverse.add(this, value);
	}),
	value: d.gs('c', function () {
		var value = this._value;
		if (typeof value === 'function') {
			value = value.call(this.obj);
			if (this._multiple) return new RelSetReadOnly(this._ns, value);
			return (value == null) ? null : this._ns._normalize(value);
		}
		if (this._multiple) {
			if (!this.hasOwnProperty('count')) this.__initSet();
			return this;
		}
		if (value == null) return value;
		return this._ns._normalize(value);
	}, function self(value) {
		var error;
		if ((error = this.validate(value))) throw error;

		this.__setValue(value);
	}),
	__setValue: d(function (value) {
		var oldValue, newValue;

		if (this.hasOwnProperty('count')) {
			this.__reset(value);
			return;
		} else if (this._multiple && isArray(value)) {
			this.__initSet();
			this.__reset(value);
			return;
		}

		oldValue = this.hasOwnProperty('_value') ? this._value : undefined;
		if (value === undefined) {
			delete this._value;
		} else {
			if ((value !== null) && (typeof value !== 'function')) {
				value = this._ns(value);
			}
			newValue = value;
			if (!this.hasOwnProperty('_value')) {
				defineProperty(this, '_value', d('cw', value));
			} else {
				this._value = value;
			}
		}

		if (oldValue === newValue) return;
		if ((oldValue !== null) && (typeof oldValue !== 'function')) {
			this.__onOld(oldValue);
		}
		if ((newValue !== null) && (typeof newValue !== 'function')) {
			this.__onNew(newValue);
		}
	}),
	__validateValue: d(function (value) {
		var key, error, ns = this._ns;
		value = ns.coerce(value);
		if (value == null) {
			return new TypeError(value + " is not valid " + ns.__id);
		}
		if ((error = ns._validate(value))) return error;
		if (!(key = ns.__serialize(value))) {
			return new TypeError(value + " is not valid dbjs value");
		}
		if (this._unique && (error = this.__uniqIndex.validate(this, key, value))) {
			return error;
		}
	}),
	validate: d('c', function (value) {
		var ns, error, errors;
		if (value === undefined) {
			if (this._required && (getPrototypeOf(this)._value == null)) {
				return new TypeError(value + " is not valid " + this._ns.__id);
			}
			return;
		}
		if (value === null) {
			if (this._required) {
				return new TypeError(value + " is not valid " + this._ns.__id);
			}
			return;
		}
		if (typeof value === 'function') return;

		ns = this._ns;
		if (this._multiple && isArray(value)) {
			if (!value.length && this._required) {
				return new TypeError(value + " is not valid " + this._ns.__id);
			}
			value.forEach(function (value) {
				if ((value == null) || (typeof value === 'function')) {
					if (!errors) errors = [];
					errors.push(new TypeError(value + " is not valid " + this._ns.__id));
					return;
				}
				if ((error = this.__validateValue(value))) {
					if (!errors) errors = [];
					errors.push(error);
					return;
				}
			}, this);
			return errors;
		}
		return this.__validateValue(value);
	})
});
