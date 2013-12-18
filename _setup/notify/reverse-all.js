'use strict';

var d              = require('d/d')
  , isGetter       = require('../utils/is-getter')
  , updateEnum     = require('../utils/update-enumerability')
  , notifyGetter   = require('../notify/getter')
  , notifyProperty = require('../notify/property')

  , defineProperty = Object.defineProperty
  , notify, notifyDescs;

notify = function (obj, sKey, nu, map, isSingular, postponed) {
	var value, desc, nuResolved, oldResolved, nuVal, oldVal, dynResolved
	  , dbEvent;

	desc = obj._getDescriptor_(sKey);

	value = desc.nested ? null : desc._resolveValueValue_();
	dbEvent = map.getLastEvent(obj);
	if (map.has(obj)) {
		nuVal = nu ? true : value;
		oldVal = nu ? value : true;
	} else {
		nuVal = nu ? (isSingular ? undefined : null) : value;
		oldVal = nu ? value : (isSingular ? undefined : null);
		if (isSingular) {
			if (nu) nuResolved = true;
			else oldResolved = true;
		}
	}

	if ((nuVal === undefined) || (oldVal === undefined)) {
		updateEnum(obj, sKey, (nuVal !== undefined));
	}

	if (isGetter(value)) {
		// Getter observers
		postponed = notifyGetter(obj, sKey, nu ? null : value, null,
			function () {
				dynResolved = true;
				return map.get(obj);
			}, desc.multiple, dbEvent, postponed);
		if (dynResolved) return postponed;
	}

	return notifyProperty(obj, sKey, nuVal, oldVal,
		nuResolved ? nuVal : function () {
			if (nuResolved) return nuVal;
			if (nu) {
				nuVal = map.get(obj);
			} else {
				if (desc.nested) nuVal = desc._getObject_(sKey);
				else if (desc.multiple) nuVal = desc._getMultiple_(sKey);
				else if (value != null) nuVal = desc._normalizeValue_(value);
				else nuVal = value;
			}
			nuResolved = true;
			return nuVal;
		}, oldResolved ? oldVal : function () {
			if (oldResolved) return oldVal;
			if (nu) {
				if (desc.nested) oldVal = desc._getObject_(sKey);
				else if (desc.multiple) oldVal = desc._getMultiple_(sKey);
				else if (value != null) oldVal = desc._normalizeValue_(value);
				else oldVal = value;
			} else {
				oldVal = map.get(obj);
			}
			oldResolved = true;
			return oldVal;
		}, dbEvent, postponed);
};

notifyDescs = function (obj, sKey, nu, map, isSingular, dbEvent, postponed) {
	if (!obj.hasOwnProperty('__descendants__')) return postponed;
	obj.__descendants__._plainForEach_(function (obj) {
		postponed = notify(obj, sKey, nu, map, isSingular, dbEvent, postponed);
		postponed = notifyDescs(obj, sKey, nu, map, isSingular, dbEvent,
			postponed);
	});
	return postponed;
};

module.exports = function (proto, rKey, nu, map, isSinglr, dbEvent, postponed) {
	var desc = proto._getOwnDescriptor_(rKey);
	if (nu) defineProperty(desc, '_reverse_', d('c', map));
	else delete desc._reverse_;
	postponed = notify(proto, rKey, nu, map, isSinglr, dbEvent, postponed);
	return notifyDescs(proto, rKey, nu, map, isSinglr, dbEvent, postponed);
};
