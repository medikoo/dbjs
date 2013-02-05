'use strict';

var d       = require('es5-ext/lib/Object/descriptor')
  , ee      = require('event-emitter/lib/core')
  , objects = require('../objects')

  , defineProperty = Object.defineProperty
  , getPrototypeOf = Object.getPrototypeOf
  , descriptor = { configurable: false, enumerable: false, writable: false }
  , proto;

proto = module.exports = objects['#'] = Object.defineProperties(ee({}), {
	_id_: d('', '#'),
	_root_: d('', null),
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
	}())),
	_prototypes_: d.gs(function () {
		var result = [], obj = this;
		if (obj === proto) return result;
		do {
			obj = getPrototypeOf(obj);
			result.push(obj);
		} while (obj !== proto);
		return result;
	})
});

require('./property');
require('./properties');
require('../history');
require('../signal');
