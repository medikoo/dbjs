// Object serializer used for sets so we can rely on primitive mode.
// will become obsolete after https://github.com/medikoo/es6-set/issues/1 is resolved

'use strict';

module.exports = function (value) {
	if (!value) return null;

	// This function may be copied for internal (serialize) use of reactive maps
	// (which are results of set.map(..) calls)
	// To allow creation of map of strings out of map of objects we passthru strings as in line below
	// It's a temporary hack, proper serialization will be ensured with
	// https://github.com/medikoo/es6-set/issues/1
	if (typeof value === 'string') return value;

	if (!value.__id__) return null;
	return value.__id__;
};
