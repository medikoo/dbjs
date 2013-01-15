'use strict';

var d       = require('es5-ext/lib/Object/descriptor')
  , objects = require('../objects')
  , proto   = require('./')

  , defineProperty = Object.defineProperty;

objects['prototype#'] = Object.defineProperties(proto, {
	_id_: d('', 'prototype#'),
	$$create: d((function () {
		var Constructor = function () {};
		return function (id) {
			var obj;
			Constructor.prototype = this;
			obj = new Constructor();
			objects[id] = defineProperty(obj, '_id_', d('', id));
			if (!this.hasOwnProperty('_children_')) {
				defineProperty(this, '_children_', d('', []));
			}
			this._children_.push(obj);
			return obj;
		};
	}()))
});
