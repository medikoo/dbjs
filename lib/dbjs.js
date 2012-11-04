'use strict';

var d      = require('es5-ext/lib/Object/descriptor')
  , object = require('./object')
  , base   = require('./base')

  , defineProperty = Object.defineProperty
  , baseCreate = base.create;

defineProperty(base, 'create', d('c', function (name, constructor, properties) {
	if (object.hasOwnProperty(name)) throw new Error("Name already taken");
	constructor = baseCreate.call(this, name, constructor, properties);
	defineProperty(object, name, d(constructor));
	return constructor;
}));

module.exports = Object.defineProperties(object, {
	boolean:  d('c', base.boolean),
	dateTime: d('c', base.dateTime),
	function: d('c', base.function),
	number:   d('c', base.number),
	regExp:   d('c', base.regExp),
	string:   d('c', base.string)
});
