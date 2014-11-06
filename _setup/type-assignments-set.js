'use strict';

var setPrototypeOf   = require('es5-ext/object/set-prototype-of')
  , d                = require('d')
  , ObjectsSet       = require('./objects-set')

  , TypeAssignmentsSet;

module.exports = TypeAssignmentsSet = function () {
	return setPrototypeOf(new ObjectsSet(), TypeAssignmentsSet.prototype);
};
setPrototypeOf(TypeAssignmentsSet, ObjectsSet);

TypeAssignmentsSet.prototype = Object.create(ObjectsSet.prototype, {
	constructor: d(TypeAssignmentsSet),
	dbKind: d('typeAssigments')
});
