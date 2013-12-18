'use strict';

var notifyMultiple = require('./item')
  , notifyProperty = require('./property')

  , hasOwnProperty = Object.prototype.hasOwnProperty
  , notifyDesc, notifyDescDescendants, notifyItem
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
	var nuValid, oldValid;

	if (desc._reverse_) return postponed;
	if (desc.nested) return postponed;
	if (desc.multiple) return postponed;

	if (nu === desc.type) nuValid = true;
	else if (desc.type.isPrototypeOf(nu)) nuValid = true;
	if (old === desc.type) oldValid = true;
	else if (desc.type.isPrototypeOf(old)) oldValid = true;

	if (nuValid === oldValid) return postponed;
	return notifyProperty(obj, desc._sKey_, nuValid ? desc._value_ : null,
		oldValid ? desc._value_ : null, null, null, dbEvent, postponed);
};

notifyDesc = function (desc, nu, old, dbEvent, postponed) {
	postponed = notifyTurnedProperty(desc.__object__, desc, nu, old,
		dbEvent, postponed);
	return notifyDescDescendants(desc.__object__, desc, nu, old,
		dbEvent, postponed);
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
	var desc = obj._getDescriptor_(item._pKey_), nuValid, oldValid;

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
	postponed = notifyTurnedItem(item.__object__, item, nu, old,
		dbEvent, postponed);
	return notifyItemDescendants(item.__object__, item, nu, old,
		dbEvent, postponed);
};

module.exports = function (obj, nu, old, dbEvent, postponed) {
	if (!obj.hasOwnProperty('__assignments__')) return postponed;
	obj.__assignments__._plainForEach_(function (obj) {
		if (obj._kind_ === 'descriptor') {
			postponed = notifyDesc(obj, nu, old, dbEvent, postponed);
			return;
		}
		postponed = notifyItem(obj, nu, old, dbEvent, postponed);
	});
	return postponed;
};
