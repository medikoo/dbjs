'use strict';

var serialize = require('../serialize/value')

  , hasOwnProperty = Object.prototype.hasOwnProperty
  , getPrototypeOf = Object.getPrototypeOf

, notify;

notify = function (obj, sKey, nu, old, nR, oR, nS, oS, dbEvent, postponed) {
	var maps = obj.__reverseMaps__, revMap;
	if ((nS === undefined) && (oS === undefined) && !nR && (nu == null) && !oR &&
			(old == null)) {
		return postponed;
	}
	while (maps) {
		if (!maps[sKey]) return postponed;
		if (!hasOwnProperty.call(maps, sKey)) {
			maps = getPrototypeOf(maps);
			continue;
		}
		revMap = maps[sKey];
		if (nS === undefined) {
			if (nR) nu = nR();
			nS = (nu == null) ? null : serialize(nu);
		}
		if (oS === undefined) {
			if (oR) old = oR();
			oS = (old == null) ? null : serialize(old);
		}
		if (!nS && !oS) return postponed;
		if (nS === oS) return postponed;
		if (oS) postponed = revMap._deleteRef_(oS, obj, dbEvent, postponed);
		if (nS) postponed = revMap._addRef_(nS, nu, obj, dbEvent, postponed);
		maps = getPrototypeOf(maps);
	}
	return postponed;
};

module.exports = notify;
