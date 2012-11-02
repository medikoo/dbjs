'use strict';

var d      = require('es5-ext/lib/Object/descriptor')
  , object = require('./object')
  , base   = require('./base')

  , defineProperty = Object.defineProperty
  , baseCreate = base.create;

base.create = function (name, constructor, properties) {
	constructor = baseCreate.call(this, name, constructor, properties);
	defineProperty(object, name, d(constructor));
	return constructor;
};

module.exports = Object.defineProperties(object, {
	boolean:  d(base.boolean),
	dateTime: d(base.dateTime),
	function: d(base.function),
	number:   d(base.number),
	regExp:   d(base.regExp),
	string:   d(base.string)
});
