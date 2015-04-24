'use strict';

var setPrototypeOf   = require('es5-ext/object/set-prototype-of')
  , d                = require('d')
  , PrimitiveSet     = require('es6-set/primitive')
  , setGetFirst      = require('es6-set/ext/get-first')
  , setGetLast       = require('es6-set/ext/get-last')
  , setCopy          = require('es6-set/ext/copy')
  , setEvery         = require('es6-set/ext/every')
  , setSome          = require('es6-set/ext/some')
  , createReadOnly   = require('observable-set/create-read-only')
  , createObservable = require('observable-set/create-complete')
  , serializeObject  = require('./serialize/object')
  , defFilterByKey   = require('./utils/define-filter-by-key')

  , propertyIsEnumerable = Object.prototype.propertyIsEnumerable, keys = Object.keys
  , ObjectsSet;

ObjectsSet = function () { return setPrototypeOf(new PrimitiveSet(), ObjectsSet.prototype); };
setPrototypeOf(ObjectsSet, PrimitiveSet);

ObjectsSet.prototype = Object.create(PrimitiveSet.prototype, {
	constructor: d(ObjectsSet),
	_serialize: d(serializeObject),
	getById: d(function (id) { return this.__setData__[id] || null; }),
	_plainForEach_: d(function (cb/*, thisArg*/) {
		var thisArg = arguments[1];
		keys(this.__setData__).forEach(function (key) {
			if (!propertyIsEnumerable.call(this, key)) return;
			cb.call(thisArg, this[key]);
		}, this.__setData__);
	})
});

defFilterByKey(ObjectsSet.prototype);

module.exports = createReadOnly(createObservable(ObjectsSet));
Object.defineProperties(module.exports.prototype, {
	first: d.gs(setGetFirst),
	last: d.gs(setGetLast),
	copy: d(setCopy),
	every: d(setEvery),
	some: d(setSome)
});
