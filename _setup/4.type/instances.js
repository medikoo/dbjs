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

  , MultiSet = createMultiSet(ObjectsSet, PrimitiveMap)
  , filter = function (obj) { return obj.constructor.prototype !== obj; }
  , Instances;

Instances = module.exports = function (Type) {
	var sets = new Set(), onAdd, onDelete, onChange, self;
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
		if (event.type === 'batch') {
			if (event.added) event.added.forEach(onAdd);
			if (event.deleted) event.deleted.forEach(onDelete);
			return;
		}
		console.log("Errorneous event:", event);
		throw new Error("Unsupported event: " + event.type);
	};
	onAdd(Type);
	self = setPrototypeOf(new MultiSet(sets, serialize), Instances.prototype);
	sets = self.sets;
	return self;
};
setPrototypeOf(Instances, MultiSet);

Instances.prototype = Object.create(MultiSet.prototype, {
	constructor: d(Instances),
	first: d.gs(setGetFirst),
	last: d.gs(setGetLast),
	copy: d(setCopy),
	every: d(setEvery),
	some: d(setSome)
});
