'use strict';

var setPrototypeOf = require('es5-ext/object/set-prototype-of')
  , d              = require('d')
  , Set            = require('es6-set')
  , setGetFirst    = require('es6-set/ext/get-first')
  , setGetLast     = require('es6-set/ext/get-last')
  , setCopy        = require('es6-set/ext/copy')
  , setEvery       = require('es6-set/ext/every')
  , setSome        = require('es6-set/ext/some')
  , PrimitiveMap   = require('es6-map/primitive')
  , createMultiSet = require('observable-multi-set/_create')
  , serialize      = require('../serialize/object')
  , ObjectsSet     = require('../objects-set')

  , defineProperty = Object.defineProperty
  , MultiSet = createMultiSet(ObjectsSet, PrimitiveMap)
  , filter = function (obj) { return obj.constructor.prototype !== obj; }
  , Instances;

Instances = module.exports = function (Type) {
	var sets = new Set(), onAdd, onDelete, onChange, self;
	onAdd = function (prototype) {
		sets.add(prototype._descendants_.filter(filter));
		prototype._descendants_.on('change', onChange);
		prototype._descendants_.forEach(onAdd);
	};
	onDelete = function (prototype) {
		sets.delete(prototype._descendants_.filter(filter));
		prototype._descendants_.off('change', onChange);
		prototype._descendants_.forEach(onDelete);
	};
	onChange = function (event) {
		var type = event.type, obj;
		if (type === 'add') {
			obj = event.value;
			if (obj.master.constructor === obj.master.constructor.prototype) onAdd(obj);
			return;
		}
		if (type === 'delete') {
			obj = event.value;
			if (obj.master.constructor === obj.master.constructor.prototype) onDelete(obj);
			return;
		}
		if (event.type === 'batch') {
			if (event.added) {
				event.added.forEach(function (obj) {
					if (obj.master.constructor === obj.master.constructor.prototype) onAdd(obj);
				});
			}
			if (event.deleted) {
				event.deleted.forEach(function (obj) {
					if (obj.master.constructor === obj.master.constructor.prototype) onAdd(obj);
				});
			}
			return;
		}
		console.log("Errorneous event:", event);
		throw new Error("Unsupported event: " + event.type);
	};
	onAdd(Type.prototype);
	self = setPrototypeOf(new MultiSet(sets, serialize), Instances.prototype);
	defineProperty(self, 'dbId', d(Type.__id__));
	sets = self.sets;
	return self;
};
setPrototypeOf(Instances, MultiSet);

Instances.prototype = Object.create(MultiSet.prototype, {
	constructor: d(Instances),
	dbKind: d('instances'),
	first: d.gs(setGetFirst),
	last: d.gs(setGetLast),
	copy: d(setCopy),
	every: d(setEvery),
	some: d(setSome)
});
