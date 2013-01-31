'use strict';

var d       = require('es5-ext/lib/Object/descriptor')
  , ee      = require('event-emitter/lib/core')
  , objects = require('../objects')

  , defineProperty = Object.defineProperty
  , descriptor = { configurable: false, enumerable: false, writable: false };

module.exports = objects['prototype#'] = Object.defineProperties(ee({}), {
	_id_: d('', 'prototype#'),
	$$create: d((function () {
		var Constructor = function () {};
		return function (id) {
			var obj;
			Constructor.prototype = this;
			obj = new Constructor();
			descriptor.value = id;
			objects[id] = defineProperty(obj, '_id_', descriptor);
			if (!this.hasOwnProperty('_children_')) {
				descriptor.value = [];
				defineProperty(this, '_children_', descriptor);
				descriptor.value = null;
			}
			this._children_.push(obj);
			return obj;
		};
	}()))
});

require('./property');
require('./properties');
require('../history');
require('../signal');
