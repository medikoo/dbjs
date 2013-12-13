'use strict';

var gatherReverseMaps = require('../utils/gather-reverse-maps')

  , keys = Object.keys, hasOwnProperty = Object.prototype.hasOwnProperty

  , notify;

notify = function (obj, pKey, isMultiple, resolve, dbEvent, postponed) {
	var data, sData, sKey, item, value, isPostponed, revMap, set, revs, i;

	// Multiple iterators
	if (obj.hasOwnProperty('__multipleIterators__')) {
		if (obj.__multipleIterators__[pKey]) {
			obj.__multipleIterators__[pKey].forEach(function (iterator) {
				iterator.__list__.slice(0, iterator.__nextIndex__)
					.forEach(function (sKey) {
						var item = this[sKey];
						if (resolve(item) === true) {
							iterator._onAdd(sKey, item.lastModified);
						}
					}, iterator.__set__.__setData__);
			});
		}
	}

	// Observable item
	if (obj.hasOwnProperty('__observableMultipleItems__')) {
		data = obj.__observableMultipleItems__[pKey];
		if (data) {
			keys(data).forEach(function (sKey) {
				var item, iData, value, observable;
				iData = obj.__multiples__[pKey];
				if (!iData) return;
				item = iData[sKey];
				if (!item) return;
				value = resolve(item);
				if (value === null) return;
				observable = data[sKey];
				observable._postponed_ += 1;
				if (!postponed) postponed = [observable];
				else postponed.push(observable);
				observable._update_(value, dbEvent);
			});
		}
	}

	// Observable set
	if (obj.hasOwnProperty('__sets__')) {
		data = obj.__sets__;
		if (hasOwnProperty.call(data, pKey)) {
			data = data[pKey];
			if (data.__isObservable__) set = data;
		}
	}

	if (isMultiple) revs = gatherReverseMaps(obj, pKey);

	if (!set && !revs) return postponed;
	sData = obj.__multiples__[pKey];
	if (!sData) return postponed;

	for (sKey in sData) {
		item = sData[sKey];
		if (!item._value_) continue;
		value = resolve(item);
		if (value == null) continue;
		if (!isPostponed) {
			if (set) {
				set._postponed_ += 1;
				if (!postponed) postponed = [set];
				else postponed.push(set);
			}
			isPostponed = true;
		}
		if (set) {
			if (value) set._emitAdd_(item._key_, dbEvent);
			else set._emitDelete_(item._key_, dbEvent);
		}
		if (revs) {
			for (i = 0; (revMap = revs[i]); ++i) {
				if (value) {
					postponed = revMap._addRef_(item._sKey_, item._key_, obj,
						dbEvent, postponed);
				} else {
					postponed = revMap._deleteRef_(item._sKey_, obj, dbEvent, postponed);
				}
			}
		}
	}
	return postponed;
};

module.exports = notify;
