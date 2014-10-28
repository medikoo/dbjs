'use strict';

var d              = require('d')
  , aFrom          = require('es5-ext/array/from')
  , setPrototypeOf = require('es5-ext/object/set-prototype-of')
  , Set            = require('es6-set/polyfill')

  , PlainSet;

module.exports = PlainSet = function (/*iterable*/) {
	return setPrototypeOf(new Set(arguments[0]), PlainSet.prototype);
};
setPrototypeOf(PlainSet, Set);

PlainSet.prototype = Object.create(Set.prototype, {
	first: d.gs(require('es6-set/ext/get-first')),
	last: d.gs(require('es6-set/ext/get-last')),
	copy: d(require('es6-set/ext/copy')),
	every: d(require('es6-set/ext/every')),
	some: d(require('es6-set/ext/some')),
	toArray: d(function () { return aFrom(this); })
});
