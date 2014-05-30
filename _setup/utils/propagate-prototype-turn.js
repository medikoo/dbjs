'use strict';

var create            = require('es5-ext/object/create')
  , d                 = require('d')
  , notifyReverse     = require('../notify/reverse-all')
  , onValueTurn       = require('../notify/on-value-turn')
  , emitDescDescValue = require('../utils/emit-desc-desc-value')
  , turn              = require('./turn-prototype')

  , hasOwnProperty = Object.hasOwnProperty, keys = Object.keys
  , getPrototypeOf = Object.getPrototypeOf, defineProperty = Object.defineProperty
  , isObjectId = RegExp.prototype.test.bind(/^[0-9a-z][A-Za-z0-9]*$/)

  , snapshotObservableObj, snapshotObservableObjKey, switchReverse
  , notifyObservableObj, notifyObservableObjKey, notifyReverses
  , emitDescs, emitMultiples, emitItems, emitDescDescs;

snapshotObservableObj = function (obj, map) {
	var descs, sKey, value, objMap;
	if (obj.hasOwnProperty('__isObservable__')) {
		descs = obj.__descriptors__;
		for (sKey in descs) {
			value = obj._get_(sKey);
			if (value === undefined) continue;
			if (!objMap) {
				if (!map) map = create(null);
				objMap = map[obj.__id__] = create(null);
			}
			objMap[sKey] = value;
		}
	}
	if (!obj.hasOwnProperty('__descendants__')) return map;
	obj.__descendants__._plainForEach_(function (obj) {
		map = snapshotObservableObj(obj, map);
	});
	return map;
};

snapshotObservableObjKey = function (obj, sKey, map) {
	var value;
	if (obj.hasOwnProperty('__isObservable__')) {
		value = obj._get_(sKey);
		if (value !== undefined) {
			if (!map) map = create(null);
			map[obj.__id__] = value;
		}
	}
	if (!obj.hasOwnProperty('__descendants__')) return map;
	obj.__descendants__._plainForEach_(function (obj) {
		map = snapshotObservableObjKey(obj, sKey, map);
	});
	return map;
};

notifyObservableObj = function (obj, map, dbEvent, postponed) {
	var descs, sKey, nu, old, objMap, marked = false;
	if (obj.hasOwnProperty('__isObservable__')) {
		descs = obj.__descriptors__;
		objMap = map && map[obj.__id__];
		for (sKey in descs) {
			nu = obj._get_(sKey);
			old = objMap && objMap[sKey];
			if (old !== undefined) delete objMap[sKey];
			if (nu === old) continue;
			if (!marked) {
				marked = true;
				obj._postponed_ += 1;
				if (!postponed) postponed = [obj];
				else postponed.push(obj);
			}
			if (nu === undefined) obj._emitDelete_(obj._keys_[sKey], old, dbEvent);
			else obj._emitSet_(obj._keys_[sKey], nu, old, dbEvent);
		}
		if (objMap) {
			for (sKey in objMap) {
				if (!marked) {
					marked = true;
					obj._postponed_ += 1;
					if (!postponed) postponed = [obj];
					else postponed.push(obj);
				}
				obj._emitDelete_(obj._keys_[sKey], objMap[sKey], dbEvent);
			}
		}
	}
	if (!obj.hasOwnProperty('__descendants__')) return postponed;
	obj.__descendants__._plainForEach_(function (obj) {
		postponed = notifyObservableObj(obj, map, dbEvent, postponed);
	});
	return postponed;
};

notifyObservableObjKey = function (obj, sKey, map, dbEvent, postponed) {
	var nu, old;
	if (obj.hasOwnProperty('__isObservable__')) {
		nu = obj._get_(sKey);
		old = map[obj.__id__];
		if (nu !== old) {
			obj._postponed_ += 1;
			if (!postponed) postponed = [obj];
			else postponed.push(obj);
			if (nu === undefined) obj._emitDelete_(obj._keys_[sKey], old, dbEvent);
			else obj._emitSet_(obj._keys_[sKey], nu, old, dbEvent);
		}
	}
	if (!obj.hasOwnProperty('__descendants__')) return postponed;
	obj.__descendants__._plainForEach_(function (obj) {
		postponed = notifyObservableObjKey(obj, sKey, map, dbEvent, postponed);
	});
	return postponed;
};

notifyReverses = function (obj, nuActive, postponed) {
	// Notify descendant reverse maps (applies only to prototypes),
	// that underlying prototype changed visibility
	var isObjectType;
	if (obj.constructor.prototype !== obj) return postponed;
	if (obj.hasOwnProperty('__reverseMaps__')) {
		isObjectType = obj.database.isObjectType;
		keys(obj.__reverseMaps__).forEach(function (sKey) {
			var map = this[sKey], desc = obj.__descriptors__[sKey];
			if (desc.reverse === undefined) return;
			if (!isObjectType(desc.type)) return;
			postponed = notifyReverse(desc.type.prototype,
				obj._serialize_(desc.reverse), nuActive, map, desc.unique, postponed);
		}, obj.__reverseMaps__);
	}
	if (!obj.hasOwnProperty('__descendants__')) return postponed;
	obj.__descendants__._plainForEach_(function (obj) {
		postponed = notifyReverses(obj, nuActive, postponed);
	});
	return postponed;
};

switchReverse = function (obj, nu, old, postponed) {
	var maps, objProto, nuTurn, oldTurn, processMap;

	// Own and descendants reverse maps
	// If type is not Object or descendant, reverse map is inactive
	objProto = nu.database.Object.prototype;
	nuTurn = ((nu === objProto) || objProto.isPrototypeOf(nu));
	oldTurn = ((old === objProto) || objProto.isPrototypeOf(old));

	if (nuTurn !== oldTurn) postponed = notifyReverses(obj, nuTurn, postponed);

	if (old.__reverseMaps__ === nu.__reverseMaps__) return postponed;

	// Old proto reverse maps
	maps = old.__reverseMaps__;
	if (maps) {
		processMap = function (sKey) {
			postponed = maps[sKey]._excludeObjBranch_(obj, sKey, postponed);
		};
		while (maps) {
			keys(maps).forEach(processMap);
			maps = getPrototypeOf(maps);
		}
	}

	// New proto reverse maps
	maps = nu.__reverseMaps__;
	if (maps) {
		processMap = function (sKey) {
			postponed = maps[sKey]._includeObjBranch_(obj, sKey, postponed);
		};
		while (maps) {
			keys(maps).forEach(processMap);
			maps = getPrototypeOf(maps);
		}
	}
	return postponed;
};

emitMultiples = function (obj, nuProto, oldProto, dbEvent, postponed) {
	var nuItems = nuProto.__multiples__, oldItems = oldProto.__multiples__
	  , sKey, nuSet, done, oldSet;
	if (nuItems === oldItems) return postponed;
	done = create(null);
	for (sKey in nuItems) {
		nuSet = nuItems[sKey];
		done[sKey] = true;
		oldSet = oldItems[sKey];
		if (nuSet === oldSet) continue;
		postponed = emitItems(obj, sKey, nuSet, oldSet, dbEvent, postponed);
	}
	for (sKey in oldItems) {
		if (done[sKey]) continue;
		oldSet = oldItems[sKey];
		postponed = emitItems(obj, sKey, null, oldSet, dbEvent, postponed);
	}
	return postponed;
};

emitItems = function (obj, sKey, nuSet, oldSet, dbEvent, postponed) {
	var done, iKey, item, ownSet, nu, old;
	if (obj.hasOwnProperty('__multiples__') &&
			hasOwnProperty.call(obj.__multiples__, sKey)) {
		ownSet = obj.__multiples__[sKey];
	}
	if (nuSet) {
		done = create(null);
		for (iKey in nuSet) {
			done[iKey] = true;
			if (ownSet && hasOwnProperty.call(ownSet, iKey) &&
					ownSet[iKey].hasOwnProperty('_value_')) {
				continue;
			}
			item = nuSet[iKey];
			nu = Boolean(item._value_);
			old = Boolean(oldSet && oldSet[iKey] && oldSet[iKey]._value_);
			if (nu === old) continue;
			postponed = item._emitValue_(obj, nu, old, dbEvent, postponed);
		}
		if (!oldSet) return postponed;
	}
	for (iKey in oldSet) {
		if (done && done[iKey]) continue;
		if (ownSet && hasOwnProperty.call(ownSet, iKey) &&
				ownSet[iKey].hasOwnProperty('_value_')) {
			continue;
		}
		item = oldSet[iKey];
		if (!item._value_) continue;
		postponed = item._emitValue_(obj, false, true, dbEvent, postponed);
	}
	return postponed;
};

emitDescDescs = function (obj, pSKey, nuDesc, oldDesc, dbEvent, postponed) {
	var descProto = obj.database.Base.prototype.__descriptorPrototype__
	  , nuDescDesc, done, nu, old, oldDescDesc, key, ownDesc;

	if (pSKey) {
		if (obj.hasOwnProperty('__descriptors__') &&
				hasOwnProperty.call(obj.__descriptors__, pSKey)) {
			ownDesc = obj.__descriptors__[pSKey];
		}
	} else if (obj.hasOwnProperty('__descriptorPrototype__')) {
		ownDesc = obj.__descriptorPrototype__;
	}
	if (nuDesc) {
		done = create(null);
		for (key in nuDesc) {
			if (key === 'reverse') continue;
			done[key] = true;
			if (ownDesc && ownDesc.hasOwnProperty(key)) continue;
			nu = nuDesc[key];
			old = oldDesc ? oldDesc[key] : descProto[key];
			if (nu === old) continue;
			nuDescDesc = nuDesc.__descriptors__[key];
			postponed = emitDescDescValue(obj, nu, old, pSKey, key,
				nuDescDesc && nuDescDesc._sideNotify_,
				nuDescDesc && nuDescDesc._postNotify_, dbEvent, postponed);
		}
	}

	if (oldDesc) {
		for (key in oldDesc) {
			if (key === 'reverse') continue;
			if (done && done[key]) continue;
			if (ownDesc && ownDesc.hasOwnProperty(key)) continue;
			old = oldDesc[key];
			if (old === descProto[key]) continue;
			oldDescDesc = oldDesc.__descriptors__[key];
			postponed = emitDescDescValue(obj, undefined, old, pSKey, key,
				oldDescDesc && oldDescDesc._sideNotify_,
				oldDescDesc && oldDescDesc._postNotify_, dbEvent, postponed);
		}
	}
	return postponed;
};

emitDescs = function (obj, nuProto, oldProto, dbEvent, postponed) {
	var nuDescs = nuProto.__descriptors__, oldDescs = oldProto.__descriptors__
	  , sKey, ownDescs, nuDesc, done, nu, old, oldDesc;
	if (nuDescs === oldDescs) return postponed;
	ownDescs = obj.hasOwnProperty('__descriptors__') ? obj.__descriptors__ : null;
	done = create(null);
	for (sKey in nuDescs) {
		done[sKey] = true;
		nuDesc = nuDescs[sKey];
		oldDesc = oldDescs[sKey] || oldProto.__descriptorPrototype__;
		postponed = emitDescDescs(obj, sKey, nuDesc, oldDesc, dbEvent, postponed);
		if (ownDescs && hasOwnProperty.call(ownDescs, sKey)) {
			if (ownDescs[sKey].hasOwnProperty('_value_')) continue;
			nu = nuDesc._resolveInner_();
			old = oldDesc ? oldDesc._resolveInner_() : undefined;
		} else {
			nu = nuDesc._resolveValueValue_();
			old = oldDesc ? oldDesc._resolveValueValue_() : undefined;
		}
		if (nu === old) continue;
		postponed = nuDesc._emitValue_(obj, nu, old, dbEvent, postponed);
	}
	for (sKey in oldDescs) {
		if (done[sKey]) continue;
		oldDesc = oldDescs[sKey];
		postponed = emitDescDescs(obj, sKey, nuProto.__descriptorPrototype__,
			oldDesc, dbEvent, postponed);
		if (ownDescs && hasOwnProperty.call(ownDescs, sKey)) {
			if (ownDescs[sKey].hasOwnProperty('_value_')) continue;
			old = oldDesc._resolveInner_();
		} else {
			old = oldDesc._resolveValueValue_();
		}
		if (old === undefined) continue;
		postponed = oldDesc._emitValue_(obj, undefined, old, dbEvent, postponed);
	}
	return postponed;
};

exports.object = function (obj, nu, dbEvent, postponed) {
	var old = getPrototypeOf(obj)
	  , objSnapshot = snapshotObservableObj(obj);

	defineProperty(obj, '__prototypeTurnInProgress__', d(true));
	postponed = switchReverse(obj, nu, old, postponed);
	postponed = turn.object(obj, nu, postponed);
	postponed = notifyObservableObj(obj, objSnapshot, dbEvent, postponed);
	if (old.__descriptorPrototype__ !== nu.__descriptorPrototpe__) {
		postponed = emitDescDescs(obj, '', nu.__descriptorPrototpe__,
			old.__descriptorPrototype__, dbEvent, postponed);
	}
	postponed = emitDescs(obj, nu, old, dbEvent, postponed);
	postponed = emitMultiples(obj, nu, old, dbEvent, postponed);

	delete obj.__prototypeTurnInProgress__;
	if (!isObjectId(obj.__id__)) return postponed;
	return onValueTurn(obj, nu.constructor, old.constructor, dbEvent, postponed);
};

exports.descriptor = function (desc, nuProto, dbEvent, postponed) {
	var oldProto = getPrototypeOf(desc), nu, old
	  , objSnapshot = snapshotObservableObjKey(desc.object, desc._sKey_);

	postponed = turn.descriptor(desc, nuProto, postponed);
	postponed = notifyObservableObjKey(desc.object, desc._sKey_, objSnapshot,
		dbEvent, postponed);
	postponed = emitDescDescs(desc.object, desc._sKey_, nuProto, oldProto,
		dbEvent, postponed);
	if (desc.hasOwnProperty('_value_')) return postponed;
	nu = nuProto._resolveInner_();
	old = oldProto._resolveInner_();
	if (nu === old) return postponed;
	return desc._emitValue_(desc.object, nu, old, dbEvent, postponed);
};
