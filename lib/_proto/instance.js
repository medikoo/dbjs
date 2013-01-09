'use strict';

var d       = require('es5-ext/lib/Object/descriptor')
  , objects = require('../objects')
  , Proto   = require('./')

  , create = Object.create, defineProperty = Object.defineProperty;

// Constructor
objects.Prototype = Object.defineProperties(Proto, {
	_id_: d('', 'Prototype'),
	$$create: d('c', function (constructor, id) {
		constructor.__proto__ = this;
		objects[id] = defineProperty(constructor, '_id_', d('', id));
		objects[id + '#'] = constructor.prototype = create(this.prototype, {
			constructor: d(constructor),
			_id_: d('', id + '#')
		});
		if (!this.hasOwnProperty('_children_')) {
			defineProperty(this, '_children_', d('', []));
		}
		if (!this.prototype.hasOwnProperty('_children_')) {
			defineProperty(this.prototype, '_children_', d('', []));
		}
		this._children_.push(constructor);
		this.prototype._children_.push(constructor.prototype);
		return constructor;
	})
});

// Prototype
objects['Prototype#'] = Object.defineProperties(Proto.prototype, {
	_id_: d('', 'Prototype#'),
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
