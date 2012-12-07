'use strict';

var d      = require('es5-ext/lib/Object/descriptor')
  , extend = require('es5-ext/lib/Object/extend-properties')
  , Base   = require('./base')

  , NumberType;

module.exports = NumberType = Base.create('Number', function (value) {
	var error = this.validate(value);
	if (error) throw error;
	return Number(value);
}, {
	is: function (value) {
		return (typeof value === 'number') && (this.min < value) &&
			(this.max > value);
	},
	validate: function (value) {
		if (isNaN(value) || (this.min > value) || (this.max < value)) {
			return new TypeError(value + " is invalid " + this._id_);
		}
		return null;
	},
	normalize: function (value) {
		return (isNaN(value) || (this.min > value) || (this.max < value)) ? null :
				Number(value);
	},
	min: -Infinity,
	max: Infinity
});

Object.defineProperties(NumberType, {
	coerce: d('c', function (value) {
		return isNaN(value) ? null : Number(value);
	}),
	_serialize_: d('c', function (value) { return '2' + value; })
});

extend(NumberType, Number);
extend(NumberType.prototype, Number.prototype);
delete NumberType.prototype.toString;
NumberType.prototype._toString.$set(Number.prototype.toString);
