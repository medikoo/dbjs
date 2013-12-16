'use strict';

var d              = require('d/d')
  , isGetter       = require('../utils/is-getter')
  , updateEnum     = require('../utils/update-enumerability')
  , notifyGetter   = require('../notify/getter')
  , notifyProperty = require('../notify/property')

  , defineProperties = Object.defineProperties;

module.exports = function (db, descriptor) {
	var property;

	property = defineProperties(descriptor.$get('nested'), {
		type: d('', db.Boolean),
		_value_: d('w', false)
	});

	defineProperties(property, {
		_sideNotify_: d(function (obj, pKey, key, nu, old, dbEvent, postponed) {
			var desc, value, nuResolved, oldResolved, dynResolved, nuValue, oldValue;

			if (!pKey) return postponed;
			desc = obj.__descriptors__[pKey];

			if (desc._reverse_) return postponed;
			value = desc._resolveValueValue_();

			if (isGetter(value)) {
				// Getter observers
				postponed = notifyGetter(obj, pKey, nu ? null : value, null,
					function () {
						dynResolved = true;
						return obj._getObject_(pKey);
					}, desc.multiple, dbEvent, postponed);
				if (dynResolved) return postponed;

			} else if (value === undefined) {
				updateEnum(obj, pKey, nu);
			}

			return notifyProperty(obj, pKey, nu ? null : value,
				nu ? value : null, function () {
					if (nuResolved) return nuValue;
					if (nu) nuValue = obj._getObject_(pKey);
					else nuValue = desc._normalizeValue_(value);
					nuResolved = true;
					return nuValue;
				}, function () {
					if (oldResolved) return oldValue;
					if (nu) oldValue = desc._normalizeValue_(value);
					else oldValue = obj._getObject_(pKey);
					oldResolved = true;
					return oldValue;
				}, dbEvent, postponed);
		})
	});
};