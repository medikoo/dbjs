'use strict';

var ee   = require('event-emitter')
  , base = require('./base')

  , Property;

module.exports = Property = function (ns, value) {
	this.value = ns(value);
	this.ns = ns;
	this.updated = base.lock;
};
ee(Property.prototype);
