'use strict';

var d            = require('es5-ext/lib/Object/descriptor')
  , ParentSet    = require('./object-set')
  , NameSet;

module.exports = NameSet = function (obj) { ParentSet.call(this, obj); };

NameSet.prototype = Object.create(ParentSet.prototype, {
	constructor: d(NameSet),
	_serialize: d(function (name) { return ':' + name; }),
});
