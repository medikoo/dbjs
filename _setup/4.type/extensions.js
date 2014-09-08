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
  , Extensions;

Extensions = module.exports = function (Type) {
	var sets = new Set(), onAdd, onDelete, onChange;
	onAdd = function (Constructor) {
		sets.add(Constructor._descendants_);
		Constructor._descendants_.on('change', onChange);
		Constructor._descendants_.forEach(onAdd);
	};
	onDelete = function (Constructor) {
		sets.delete(Constructor._descendants_);
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
	MultiSet.call(this, sets, serialize);
	sets = this.sets;
};
setPrototypeOf(Extensions, MultiSet);

Extensions.prototype = Object.create(MultiSet.prototype, {
	constructor: d(Extensions),
	first: d.gs(setGetFirst),
	last: d.gs(setGetLast),
	copy: d(setCopy),
	every: d(setEvery),
	some: d(setSome)
});
