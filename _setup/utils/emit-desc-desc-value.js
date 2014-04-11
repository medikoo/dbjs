'use strict';

var notify = require('../notify/desc-property')

  , hasOwnProperty = Object.prototype.hasOwnProperty
  , notifyDescs, notifyNamedDescs, notifyNamedDescsObj;

notifyDescs = function (obj, pSKey, key, nu, old, dbEvent, sideNotify,
	postponed) {
	if (!obj.hasOwnProperty('__descendants__')) return postponed;
	obj.__descendants__._plainForEach_(function (obj) {
		var desc;
		if (obj.hasOwnProperty('__descriptors__')) {
			if (hasOwnProperty.call(obj.__descriptors__, pSKey)) {
				desc = obj.__descriptors__[pSKey];
				if (desc.hasOwnProperty('__descriptors__')) {
					if (hasOwnProperty.call(desc.__descriptors__, key)) {
						if (desc.__descriptors__[key].hasOwnProperty('_value_')) return;
					}
				}
			}
		}
		postponed = notify(obj, pSKey, key, nu, old, dbEvent, postponed);
		if (sideNotify) {
			postponed = sideNotify(obj, pSKey, key, nu, old, dbEvent, postponed);
		}
		postponed = notifyDescs(obj, pSKey, key, nu, old, dbEvent,
			sideNotify, postponed);
	});
	return postponed;
};

notifyNamedDescsObj = function (obj, key, nu, old, dbEvent, sidNfy, postponed) {
	if (obj.hasOwnProperty('__descriptorPrototype__')) {
		return notifyNamedDescs(obj.__descriptorPrototype__, key, nu, old, dbEvent,
			sidNfy, postponed);
	}
	if (!obj.hasOwnProperty('__descendants__')) return postponed;
	obj.__descendants__._plainForEach_(function (obj) {
		postponed = notifyNamedDescsObj(obj, key, nu, old, dbEvent, sidNfy,
			postponed);
	});
	return postponed;
};

notifyNamedDescs = function (descP, key, nu, old, dbEvent, sidNfy, postponed) {
	if (!descP.hasOwnProperty('__descendants__')) return postponed;
	descP.__descendants__._plainForEach_(function (desc) {
		var obj;
		if (!desc._sKey_) {
			postponed = notifyNamedDescs(desc, key, nu, old, dbEvent,
				sidNfy, postponed);
			return;
		}
		obj = desc.object;
		postponed = notify(obj, desc._sKey_, key, nu, old, dbEvent, postponed);
		if (sidNfy) {
			postponed = sidNfy(obj, desc._sKey_, key, nu, old, dbEvent, postponed);
		}
		postponed = notifyDescs(obj, desc._sKey_, key, nu, old, dbEvent,
			sidNfy, postponed);
	});
	return postponed;
};

module.exports = function (obj, nu, old, pSKey, key, sn, pn, dbEv, postponed) {
	postponed = notify(obj, pSKey, key, nu, old, dbEv, postponed);
	if (sn) postponed = sn(obj, pSKey, key, nu, old, dbEv, postponed);
	postponed = notifyDescs(obj, pSKey, key, nu, old, dbEv, sn, postponed);
	if (!pSKey) {
		postponed = notifyNamedDescsObj(obj, key, nu, old, dbEv, sn, postponed);
	}
	if (pn) pn();
	return postponed;
};
