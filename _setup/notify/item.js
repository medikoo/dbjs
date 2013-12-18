'use strict';

var notifyReverse = require('./reverse')

  , hasOwnProperty = Object.prototype.hasOwnProperty
  , notify;

notify = function (obj, pSKey, sKey, key, value, res, dbEvent, postponed) {
	var data, desc = obj._getDescriptor_(pSKey);

	// Iterators
	if (obj.hasOwnProperty('__multipleIterators__')) {
		if (obj.__multipleIterators__[pSKey]) {
			obj.__multipleIterators__[pSKey].forEach(function (iterator) {
				if (!value) iterator._onDelete(sKey);
				else iterator._onAdd(sKey);
			});
		}
	}

	// Reverse
	if (desc.multiple) {
		postponed = notifyReverse(obj, pSKey, value ? key : null, value ? null : key,
			null, null, undefined, undefined, dbEvent, postponed);
	}

	// Observable item
	if (obj.hasOwnProperty('__observableMultipleItems__')) {
		data = obj.__observableMultipleItems__[pSKey];
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
	if (!hasOwnProperty.call(data, pSKey)) return postponed;
	data = data[pSKey];
	if (!data.__isObservable__) return postponed;
	data._postponed_ += 1;
	if (!postponed) postponed = [data];
	else postponed.push(data);
	if (value) data._emitAdd_(key, dbEvent);
	else data._emitDelete_(key, dbEvent);
	return postponed;
};

module.exports = notify;
