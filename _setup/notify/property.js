'use strict';

var notifyReverse = require('./reverse')

  , notify;

notify = function (obj, sKey, nu, old, nuRes, oldRes, dbEvent, postponed) {
	var data;

	// Iterators
	if (((nu === undefined) || (old === undefined)) &&
			obj.hasOwnProperty('__iterators__')) {
		obj.__iterators__.forEach(function (iterator) {
			if (nu === undefined) iterator._onDelete(sKey);
			else iterator._onSet(sKey, dbEvent ? dbEvent.stamp : 0);
		});
	}

	// Reverse
	postponed = notifyReverse(obj, sKey, nu, old, nuRes, oldRes,
		undefined, undefined, dbEvent, postponed);

	// Observable property
	if (obj.hasOwnProperty('__observableProperties__')) {
		data = obj.__observableProperties__[sKey];
		if (data) {
			data._postponed_ += 1;
			if (!postponed) postponed = [data];
			else postponed.push(data);
			if (nuRes) {
				nu = nuRes();
				nuRes = null;
			}
			data._update_(nu, dbEvent);
		}
	}

	// Observable map
	if (!obj.hasOwnProperty('__isObservable__')) return postponed;
	if (nuRes) nu = nuRes();
	if (oldRes) old = oldRes();
	if (nu === old) return postponed;
	obj._postponed_ += 1;
	if (!postponed) postponed = [obj];
	else postponed.push(obj);
	if (nu === undefined) obj._emitDelete_(obj._keys_[sKey], old, dbEvent);
	else obj._emitSet_(obj._keys_[sKey], nu, old, dbEvent);
	return postponed;
};

module.exports = notify;
