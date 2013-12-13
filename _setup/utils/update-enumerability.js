'use strict';

var defineProperty = Object.defineProperty;

module.exports = function (obj, sKey, nu) {
	var accessor = obj._accessors_[sKey], key;
	if (!accessor) return;
	key = obj._keys_[sKey];
	if (nu) {
		if (!obj.hasOwnProperty(key)) defineProperty(obj, key, accessor);
	} else if (obj.hasOwnProperty(key)) {
		delete obj[key];
	}
};
