'use strict';

var notify;

notify = function (obj, sKey, getter, val, rVal, isMulti, dbEvent, postponed) {
	var data;
	if (obj.hasOwnProperty('__dynamicValues__')) {
		data = obj.__dynamicValues__[sKey];
		if (data) {
			if (rVal) val = rVal();
			postponed = data._updateObserver_(getter, dbEvent, val, postponed);
		}
	}
	if (!isMulti) return postponed;
	if (!obj.hasOwnProperty('__dynamicMultiples__')) return postponed;
	data = obj.__dynamicMultiples__[sKey];
	if (!data) return postponed;
	data._updateGetter_(getter);
	return postponed;
};

module.exports = notify;
