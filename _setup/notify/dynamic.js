'use strict';

module.exports = function (obj, sKey, dbEvent, postponed) {
	var data;
	if (!obj.hasOwnProperty('__dynamicValues__')) return postponed;
	data = obj.__dynamicValues__[sKey];
	if (!data) return postponed;
	return data.__triggerObserverUpdate__(dbEvent, postponed);
};
