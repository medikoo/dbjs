'use strict';

var hasOwnProperty = Object.prototype.hasOwnProperty;

module.exports = function (obj, pSKey, key, nu, old, dbEvent, postponed) {
	var data;

	// Iterators
	if (obj.hasOwnProperty('__descriptorIterators__')) {
		if (obj.__descriptorIterators__[pSKey]) {
			obj.__descriptorIterators__[pSKey].forEach(function (iterator) {
				if (nu === undefined) iterator._onDelete(key);
				else iterator._onSet(key, dbEvent ? dbEvent.stamp : 0);
			});
		}
	}

	// Observable property
	if (obj.hasOwnProperty('__observableDescriptorProperties__')) {
		data = obj.__observableDescriptorProperties__[pSKey];
		if (data) {
			data = data[key];
			if (data) {
				data._postponed_ += 1;
				if (!postponed) postponed = [data];
				else postponed.push(data);
				data._update_(nu, dbEvent);
			}
		}
	}

	// Observable map
	if (!obj.hasOwnProperty('__descriptors__')) return postponed;
	data = obj.__descriptors__;
	if (!hasOwnProperty.call(data, pSKey)) return postponed;
	data = data[pSKey];
	if (!data.__isObservable__) return postponed;
	data._postponed_ += 1;
	if (!postponed) postponed = [data];
	else postponed.push(data);
	if (nu === undefined) data._emitDelete_(key, old, dbEvent);
	else data._emitSet_(key, nu, old, dbEvent);
	return postponed;
};
