'use strict';

var d              = require('d')
  , setPrototypeOf = require('es5-ext/object/set-prototype-of')
  , Set            = require('es6-set/polyfill')

  , PlainSet;

module.exports = PlainSet = function (/*iterable*/) {
	if (!(this instanceof PlainSet)) return new PlainSet(arguments[0]);
	Set.call(this, arguments[0]);
};
setPrototypeOf(PlainSet, Set);

PlainSet.prototype = Object.create(Set.prototype, {
	copy: d(require('es6-set/ext/copy')),
	every: d(require('es6-set/ext/every')),
	some: d(require('es6-set/ext/some'))
});
