'use strict';

var d         = require('es5-ext/lib/Object/descriptor')
  , fillChain = require('./define').fillChain
  , dummyNs   = require('./dummy-ns')

  , defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties

  , RelBasic, Constructor, signal;

RelBasic = function (obj, name, descriptor) {
	defineProperties(this, {
		obj: d('', obj),
		name: d.gs('', function () { return name; }),
		_id_: d('', obj._id_ + ':' + name),
		_descriptor_: d('', descriptor)
	});
};

Constructor = function (obj) {
	defineProperties(this, {
		obj: d('', obj),
		_id_: d('', obj._id_ + ':' + this.name)
	});
};
defineProperties(RelBasic.prototype, {
	ns: d(dummyNs),
	_create_: d(function (obj) {
		// Avoid Object.create for performance reasons
		Constructor.prototype = this;
		return new Constructor(obj);
	}),
	value: d.gs(function () {
		return this._value;
	}, function self(value) {
		var error = this.validate(value);
		if (error) throw error;
		value = this._normalize(value);
		this.$setValue(value);
		signal(this, value);
	}),
	_normalize: d(Boolean),
	$setValue: d(function (value) {
		if (value === undefined) {
			if (this.hasOwnProperty('_value') &&
					!this.hasOwnProperty('_descriptor_')) {
				delete this.obj[this.name];
				delete this._value;
			}
			return;
		}
		if (!this.hasOwnProperty('_value') &&
				!this.hasOwnProperty('_descriptor_')) {
			defineProperty(this.obj, this.name, this._descriptor_);
		}
		this._value = value;
	}),
	$setMultiValue: d(function (value) {
		this.$setValue(value);
		signal(this, value);
	}),
	validate: d(function (value) { return null; })
});

module.exports = function (obj, name, value) {
	var get, set, rel, relName, attr;

	relName = '__' + name;
	attr = ((typeof obj === 'function') || !obj._id_ || obj._descriptor_) ? '' :
			'e';
	rel = new RelBasic(obj, name, d.gs('c' + attr, get = function () {
		return this[relName]._value;
	}, set = function (value) {
		if (!this.hasOwnProperty(relName)) fillChain(this, relName);
		this[relName].value = value;
	}));
	rel._value = value;

	defineProperty(obj, relName, d('', rel));
	defineProperty(obj, '_' + name, d.gs('', function () {
		if (!this.hasOwnProperty(relName)) fillChain(this, relName);
		return this[relName];
	}));
	defineProperty(obj, name, d.gs(attr, get, set));
};

signal = require('./signal');
