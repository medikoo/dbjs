'use strict';

var d              = require('d/d')
  , isGetter       = require('../utils/is-getter')
  , updateEnum     = require('../utils/update-enumerability')
  , notifyGetter   = require('../notify/getter')
  , notifyProperty = require('../notify/property')

  , defineProperties = Object.defineProperties
  , defineProperty = Object.defineProperty;

module.exports = function (db, descriptor) {
	var property;

	property = defineProperties(descriptor.$getOwn('nested'), {
		type: d('e', db.Boolean),
		_value_: d('w', false)
	});
	defineProperty(descriptor, 'nested', descriptor._accessors_.nested);

	defineProperties(property, {
		_sideNotify_: d(function (obj, pSKey, key, nu, old, dbEvent, postponed) {
			var desc, value, nuResolved, oldResolved, dynResolved, nuValue, oldValue;

			if (!pSKey) return postponed;
			desc = obj.__descriptors__[pSKey];
			if (!desc) desc = obj.__descriptorPrototype__;

			if (desc._reverse_) return postponed;
			value = desc._resolveValueValue_();

			if (isGetter(value)) {
				// Getter observers
				postponed = notifyGetter(obj, pSKey, nu ? null : value, null,
					function () {
						dynResolved = true;
						return obj._getObject_(pSKey);
					}, desc.multiple, dbEvent, postponed);
				if (dynResolved) return postponed;

			} else if (value === undefined) {
				updateEnum(obj, pSKey, nu);
			}

			return notifyProperty(obj, pSKey, nu ? null : value,
				nu ? value : null, function () {
					if (nuResolved) return nuValue;
					if (nu) nuValue = obj._getObject_(pSKey);
					else nuValue = desc._normalizeValue_(value);
					nuResolved = true;
					return nuValue;
				}, function () {
					if (oldResolved) return oldValue;
					if (nu) oldValue = desc._normalizeValue_(value);
					else oldValue = obj._getObject_(pSKey);
					oldResolved = true;
					return oldValue;
				}, dbEvent, postponed);
		})
	});
};
