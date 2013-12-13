'use strict';

var notifyMultiple = require('./item')
  , notifyProperty = require('./property')

  , hasOwnProperty = Object.prototype.hasOwnProperty
  , notifyDescs, notifyItems, notifyDesc, notifyDescDescendants, notifyItem
  , notifyItemDescendants, notifyTurnedProperty, notifyTurnedItem;

notifyDescDescendants = function (obj, desc, nu, old, dbEvent, postponed) {
	if (!obj.hasOwnProperty('__descendants__')) return postponed;
	obj.__descendants__._plainForEach_(function (obj) {
		if (obj.hasOwnProperty('__descriptors__')) {
			if (hasOwnProperty.call(obj.__descriptors__, desc._sKey_)) return;
		}
		postponed = notifyTurnedProperty(obj, desc, nu, old, dbEvent, postponed);
		postponed = notifyDescDescendants(obj, desc, nu, old, dbEvent, postponed);
	});
	return postponed;
};

notifyTurnedProperty = function (obj, desc, nu, old, dbEvent, postponed) {
	if (desc._reverse_) return postponed;
	if (desc.nested) return postponed;
	if (desc.multiple) return postponed;

	return notifyProperty(obj, desc._sKey_, nu ? desc._value_ : null,
		old ? desc._value_ : null, null, null, dbEvent, postponed);
};

notifyDesc = function (desc, nu, old, dbEvent, postponed) {
	postponed = notifyTurnedProperty(desc.__master__, desc, nu, old,
		dbEvent, postponed);
	return notifyDescDescendants(desc.__master__, desc, nu, old,
		dbEvent, postponed);
};

notifyDescs = function (desc, obj, nu, old, dbEvent, postponed) {
	if (!desc.hasOwnProperty('__descendants__')) return postponed;
	desc.__descendants__._plainForEach_(function (desc) {
		var nuValid, oldValid;
		if (desc._sKey_ && desc.hasOwnProperty('_value_') &&
				(desc._value_ === obj)) {
			if (nu === desc.type) nuValid = true;
			else if (desc.type.isPrototypeOf(nu)) nuValid = true;
			if (old === desc.type) oldValid = true;
			else if (desc.type.isPrototypeOf(old)) oldValid = true;
			if (nuValid !== oldValid) {
				postponed = notifyDesc(desc, nuValid, oldValid, dbEvent, postponed);
			}
		}
		postponed = notifyDescs(desc, obj, nu, old, dbEvent, postponed);
	});
	return postponed;
};

notifyItemDescendants = function (obj, item, nu, old, dbEvent, postponed) {
	if (!obj.hasOwnProperty('__descendants__')) return postponed;
	obj.__descendants__._plainForEach_(function (obj) {
		if (obj.hasOwnProperty('__multiples__')) {
			if (hasOwnProperty.call(obj.__multiples__, item._pKey_)) {
				if (hasOwnProperty.call(obj.__multiples__[item._pKey_], item._sKey_)) {
					return;
				}
			}
		}
		postponed = notifyTurnedItem(obj, item, nu, old, dbEvent, postponed);
		postponed = notifyItemDescendants(obj, item, nu, old, dbEvent, postponed);
	});
	return postponed;
};

notifyTurnedItem = function (obj, item, nu, old, dbEvent, postponed) {
	var desc = obj.__descriptors__[item._pKey_] || obj.__descriptorPrototype__
	  , nuValid, oldValid;

	if (desc._reverse_) return postponed;
	if (desc.nested) return postponed;
	if (!desc.multiple) return postponed;

	if (nu === desc.type) nuValid = true;
	else if (desc.type.isPrototypeOf(nu)) nuValid = true;
	if (old === desc.type) oldValid = true;
	else if (desc.type.isPrototypeOf(old)) oldValid = true;

	if (nuValid === oldValid) return postponed;

	return notifyMultiple(obj, item._pKey_, item._sKey_, item._key_, nuValid,
		null, dbEvent, postponed);
};

notifyItem = function (item, nu, old, dbEvent, postponed) {
	postponed = notifyTurnedItem(item.__master__, item, nu, old,
		dbEvent, postponed);
	return notifyItemDescendants(item.__master__, item, nu, old,
		dbEvent, postponed);
};

notifyItems = function (item, obj, nu, old, dbEvent, postponed) {
	if (!item.hasOwnProperty('__descendants__')) return postponed;
	item.__descendants__._plainForEach_(function (item) {
		if (item._pKey_ && (item._key_ === obj) && item._value_) {
			postponed = notifyItem(item, nu, old, dbEvent, postponed);
		}
		postponed = notifyItems(item, obj, nu, old, dbEvent, postponed);
	});
	return postponed;
};

module.exports = function (obj, nu, old, dbEvent, postponed) {
	var proto = obj._db_.Base.prototype;
	postponed = notifyDescs(proto.__descriptorPrototype__, obj,
		nu, old, dbEvent, postponed);
	return notifyItems(proto.__itemPrototype__, obj, nu, old, dbEvent, postponed);
};
