'use strict';

var d          = require('es5-ext/lib/Object/descriptor')
  , extend     = require('es5-ext/lib/Object/extend-properties')
  , base       = require('./base')
  , number     = require('./number')
  , RegExpType = require('./reg-exp')

  , stringify = JSON.stringify

  , string;

module.exports = string = base.create('string', function self(value) {
	value = String(value);
	if (self.pattern && !value.match(self.pattern)) {
		throw new TypeError(value + " is not valid " + self.__id);
	}
	if (self.max && (value.length > self.max)) {
		throw new TypeError(value + " is too long");
	}
	if (self.min && (value.length < self.min)) {
		throw new TypeError(value + " is too short");
	}
	return value;
}, {
	is: function (value) {
		if (typeof value !== 'string') return false;
		if (this.pattern && !value.match(this.pattern)) return false;
		if (this.max && (value.length > this.max)) return false;
		if (this.min && (value.length < this.min)) return false;
		return true;
	},
	normalize: function (value) {
		value = String(value);
		if (this.pattern && !value.match(this.pattern)) return null;
		if (this.max && (value.length > this.max)) return null;
		if (this.min && (value.length < this.min)) return null;
		return value;
	},
	validate: function (value) {
		value = String(value);
		if (this.pattern && !value.match(this.pattern)) {
			return new TypeError(value + " is not valid " + this.__id);
		}
		if (this.max && (value.length > this.max)) {
			return new TypeError(value + " is too long");
		}
		if (this.min && (value.length < this.min)) {
			return new TypeError(value + " is too short");
		}
		return null;
	},
	pattern: RegExpType,
	min: number,
	max: number
});

Object.defineProperties(string, {
	coerce: d('c', String),
	_serialize_: d('c', function (value) {
		return '3' + stringify(value).slice(1, -1);
	})
});

extend(string, String);
extend(string.prototype, String.prototype);
delete string.prototype.toString;
string.prototype._toString.$set(String.prototype.toString);
