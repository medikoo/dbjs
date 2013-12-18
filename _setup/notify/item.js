'use strict';

var notifyReverse = require('./reverse')

  , hasOwnProperty = Object.prototype.hasOwnProperty
  , notify;

notify = function (obj, pKey, sKey, key, value, res, dbEvent, postponed) {
	var data, desc = obj.__descriptors__[pKey] || obj.__descriptorPrototype__;

	// Iterators
	if (obj.hasOwnProperty('__multipleIterators__')) {
		if (obj.__multipleIterators__[pKey]) {
			obj.__multipleIterators__[pKey].forEach(function (iterator) {
				if (!value) iterator._onDelete(sKey);
				else iterator._onAdd(sKey);
			});
		}
	}

	// Reverse
	if (desc.multiple) {
		postponed = notifyReverse(obj, pKey, value ? key : null, value ? null : key,
			null, null, undefined, undefined, dbEvent, postponed);
	}

	// Observable item
	if (obj.hasOwnProperty('__observableMultipleItems__')) {
		data = obj.__observableMultipleItems__[pKey];
		if (data) {
			data = data[sKey];
			if (data) {
				data._postponed_ += 1;
				if (!postponed) postponed = [data];
				else postponed.push(data);
				data._update_(value, dbEvent);
			}
		}
	}

	// Observable set
	if (!obj.hasOwnProperty('__sets__')) return postponed;
	data = obj.__sets__;
	if (!hasOwnProperty.call(data, pKey)) return postponed;
	data = data[pKey];
	if (!data.__isObservable__) return postponed;
	data._postponed_ += 1;
	if (!postponed) postponed = [data];
	else postponed.push(data);
	if (value) data._emitAdd_(key, dbEvent);
	else data._emitDelete_(key, dbEvent);
	return postponed;
};

module.exports = notify;
