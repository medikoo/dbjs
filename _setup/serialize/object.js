// Object serializer used for sets so we can rely on primitive mode.
// will become obsolete after https://github.com/medikoo/es6-set/issues/1 is resolved

'use strict';

module.exports = function (value) {
	if (!value) return null;
	if (typeof value === 'string') return value; // Allow mapping to string values
	if (!value.__id__) return null;
	return value.__id__;
};
