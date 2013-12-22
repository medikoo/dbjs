'use strict';

var setPrototypeOf = require('es5-ext/object/set-prototype-of')
  , d              = require('d/d')
  , Set            = require('es6-set')
  , MultiSet       = require('observable-multi-set/primitive')
  , serialize      = require('../serialize/object')
  , defFilterByKey = require('../utils/define-filter-by-key')

  , filter = function (obj) { return obj.constructor.prototype !== obj; }
  , Instances;

Instances = module.exports = function (Type) {
	var sets = new Set(), onAdd, onDelete, onChange;
	onAdd = function (Constructor) {
		sets.add(Constructor.prototype._descendants_.filter(filter));
		Constructor._descendants_.on('change', onChange);
		Constructor._descendants_.forEach(onAdd);
	};
	onDelete = function (Constructor) {
		sets.delete(Constructor.prototype._descendants_.filter(filter));
		Constructor._descendants_.off('change', onChange);
		Constructor._descendants_.forEach(onDelete);
	};
	onChange = function (event) {
		var type = event.type;
		if (type === 'add') {
			onAdd(event.value);
			return;
		}
		if (type === 'delete') {
			onDelete(event.value);
			return;
		}
		// Must not happen, left for eventual awareness
		throw new Error("Unsupported event");
	};
	onAdd(Type);
	MultiSet.call(this, sets, serialize);
	sets = this.sets;
};
setPrototypeOf(Instances, MultiSet);

Instances.prototype = Object.create(MultiSet.prototype, {
	constructor: d(Instances)
});

defFilterByKey(Instances.prototype);
