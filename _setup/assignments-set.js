'use strict';

var setPrototypeOf   = require('es5-ext/object/set-prototype-of')
  , d                = require('d')
  , ObjectsSet       = require('./objects-set')

  , AssignmentsSet;

module.exports = AssignmentsSet = function () {
	return setPrototypeOf(new ObjectsSet(), AssignmentsSet.prototype);
};
setPrototypeOf(AssignmentsSet, ObjectsSet);

AssignmentsSet.prototype = Object.create(ObjectsSet.prototype, {
	constructor: d(AssignmentsSet),
	dbKind: d('assigments')
});
