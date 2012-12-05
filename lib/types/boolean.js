'use strict';

var d      = require('es5-ext/lib/Object/descriptor')
  , extend = require('es5-ext/lib/Object/extend-properties')
  , base   = require('./base')

  , boolean;

module.exports = boolean = base.create('boolean', function (value) {
	return Boolean(value && value.valueOf());
}, {
	is: function (value) { return (typeof value === 'boolean'); },
	normalize: function (value) { return Boolean(value); }
});

Object.defineProperties(boolean, {
	coerce: d('c', boolean.normalize),
	_serialize_: d('c', function (value) { return '0' + Number(value); })
});

extend(boolean, Boolean);
extend(boolean.prototype, Boolean.prototype);
delete boolean.prototype.toString;
boolean.prototype._toString.$set(Boolean.prototype.toString);
