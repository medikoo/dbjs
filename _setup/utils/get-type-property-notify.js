'use strict';

var isGetter       = require('../utils/is-getter')
  , notifyDynamic  = require('../notify/dynamic')
  , notifyItems    = require('../notify/items')
  , notifyProperty = require('../notify/property')

  , create = Object.create
  , nuCache, oldCache, confirmItem;

confirmItem = function (oldType, nuDesc, oldDesc, item) {
	var oldStatus, nuStatus, sKey = item._sKey_, key = item.key;
	if (!oldCache) oldCache = create(null);
	if (oldCache[sKey] != null) oldStatus = oldCache[sKey];
	else oldStatus = oldCache[sKey] = (oldType.normalize(key, oldDesc) != null);
	if (!nuCache) nuCache = create(null);
	if (nuCache[sKey] != null) nuStatus = nuCache[sKey];
	else nuStatus = nuCache[sKey] = (this.normalize(key, nuDesc) != null);
	if (oldStatus === nuStatus) return null;
	return nuStatus;
};

module.exports = exports = function (types) {
	var isType;

	isType = function (Type) {
		if (Type === this) return true;
		return Type.isPrototypeOf(this);
	};

	return function (obj, pSKey, nt, ot, nd, od, dbEvent, postponed) {
		var value, nuValue, oldValue;

		if (!types.some(isType, nt)) return postponed;

		// Multiples
		postponed = notifyItems(obj, pSKey, nd.multiple,
			confirmItem.bind(nt, ot, nd, od), dbEvent, postponed);

		if (nd._reverse_) return postponed;
		if (nd.nested) return postponed;

		// Value
		value = nd._resolveValueValue_();
		if (value == null) return postponed;

		// Dynamics
		if (isGetter(value)) return notifyDynamic(obj, pSKey, dbEvent, postponed);
		if (nd.multiple) return postponed;

		return notifyProperty(obj, pSKey, value, value, function () {
			if (nuValue !== undefined) return nuValue;
			return (nuValue = nt.normalize(value, nd));
		}, function () {
			if (oldValue !== undefined) return oldValue;
			return (oldValue = ot.normalize(value, od));
		}, dbEvent, postponed);
	};
};
exports.clear = function () { nuCache = oldCache = null; };
