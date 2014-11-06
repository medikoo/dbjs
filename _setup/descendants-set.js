'use strict';

var setPrototypeOf   = require('es5-ext/object/set-prototype-of')
  , d                = require('d')
  , ObjectsSet       = require('./objects-set')

  , DescendantsSet;

module.exports = DescendantsSet = function () {
	return setPrototypeOf(new ObjectsSet(), DescendantsSet.prototype);
};
setPrototypeOf(DescendantsSet, ObjectsSet);

DescendantsSet.prototype = Object.create(ObjectsSet.prototype, {
	constructor: d(DescendantsSet),
	dbKind: d('descendants')
});
