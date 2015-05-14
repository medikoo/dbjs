'use strict';

var create         = require('es5-ext/object/create')
  , d              = require('d')
  , setPrototypeOf = require('es5-ext/object/set-prototype-of')
  , isNested       = require('../../is-dbjs-nested-object')

  , hasOwnProperty = Object.hasOwnProperty
  , defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , getPrototypeOf = Object.getPrototypeOf
  , keys = Object.keys

  , turnDescProto, turnDescMaps, turnDescs
  , turnDescPropMaps, turnDescProperties, turnMultiples
  , turnMultiple, turnItems, turnReverse, turn;

turnDescProto = function (obj, proto, postponed) {
	var descriptor, old, nu;
	if (obj.hasOwnProperty('__descriptorPrototype__')) {
		descriptor = obj.__descriptorPrototype__;
		old = getPrototypeOf(descriptor);
		nu = proto.__descriptorPrototype__;
		if (old === nu) return postponed;
		postponed = turn(descriptor, nu, old, postponed);
		return turnDescPropMaps(descriptor, nu, postponed);
	}
	if (!obj.hasOwnProperty('__descendants__')) return postponed;
	obj.__descendants__._plainForEach_(function (obj) {
		postponed = turnDescProto(obj, proto, postponed);
	});
	return postponed;
};

turnDescPropMaps = function (desc, proto, postponed) {
	var nu, old;
	if (desc.hasOwnProperty('__descriptors__')) {
		old = getPrototypeOf(desc.__descriptors__);
		nu = proto.__descriptors__;
		if (old === nu) return postponed;
		setPrototypeOf(desc.__descriptors__, nu);
		return turnDescProperties(desc, nu, postponed);
	}
	if (!desc.hasOwnProperty('__descendants__')) return postponed;
	desc.__descendants__._plainForEach_(function (desc) {
		postponed = turnDescPropMaps(desc, proto, postponed);
	});
	return postponed;
};

turnDescProperties = function (desc, proto, postponed, done) {
	keys(desc.__descriptors__).forEach(function (name) {
		var property = this[name], old, nu;
		if (!done) done = create(null);
		else if (done[name]) return;
		old = getPrototypeOf(property);
		nu = proto[name] || desc.__descriptorPrototype__;
		done[name] = true;
		if (old === nu) return;
		if (!nu.key && property.key && !property.hasOwnProperty('key')) {
			defineProperties(property, {
				key: d('', property.key),
				_pSKey_: d('', property._pSKey_),
				_create_: d(property._create_)
			});
		} else if (!nu._pSKey_ && property._pSKey_ &&
				!property.hasOwnProperty('_pSKey_')) {
			defineProperty(property, '_pSKey_', d('', property._pSKey_));
		}
		postponed = turn(property, nu, old, postponed);
	}, desc.__descriptors__);
	if (!desc.hasOwnProperty('__descendants__')) return postponed;
	desc.__descendants__._plainForEach_(function self(desc) {
		if (desc.hasOwnProperty('__descriptors__')) {
			postponed = turnDescProperties(desc, proto, postponed,
				done && create(done));
			return;
		}
		if (desc.hasOwnProperty('__descendants__')) {
			desc.__descendants__._plainForEach_(self);
		}
	});
	return postponed;
};

turnDescMaps = function (obj, proto, oldProto, postponed) {
	var nu, old;
	if (obj.hasOwnProperty('__descriptors__')) {
		old = getPrototypeOf(obj.__descriptors__);
		nu = proto.__descriptors__;
		if (old !== nu) {
			setPrototypeOf(obj.__descriptors__, nu);
		} else {
			if (obj.hasOwnProperty('__descriptorPrototype__') ||
					(proto.__descriptorPrototype__ === oldProto.__descriptorPrototype__)) {
				return;
			}
		}
		return turnDescs(obj, proto, postponed);
	}
	if (!obj.hasOwnProperty('__descendants__')) return postponed;
	obj.__descendants__._plainForEach_(function (obj) {
		postponed = turnDescMaps(obj, proto, oldProto, postponed);
	});
	return postponed;
};

turnDescs = function (obj, proto, postponed, done) {
	keys(obj.__descriptors__).forEach(function (sKey) {
		var descriptor = this[sKey], old, nu;
		if (!done) done = create(null);
		else if (done[sKey]) return;
		old = getPrototypeOf(descriptor);
		nu = proto.__descriptors__[sKey] || proto.__descriptorPrototype__;
		done[sKey] = true;
		if (old === nu) return;
		if (!nu._sKey_ && descriptor._sKey_ &&
				!descriptor.hasOwnProperty('_sKey_')) {
			defineProperties(descriptor, {
				key: d('', descriptor.key),
				_sKey_: d('', descriptor._sKey_),
				_create_: d(descriptor._create_)
			});
		}
		postponed = turn(descriptor, nu, old, postponed);
		postponed = turnDescPropMaps(descriptor, nu, postponed);
	}, obj.__descriptors__);
	if (!obj.hasOwnProperty('__descendants__')) return postponed;
	obj.__descendants__._plainForEach_(function self(obj) {
		if (obj.hasOwnProperty('__descriptors__')) {
			postponed = turnDescs(obj, proto, postponed, done && create(done));
			return;
		}
		if (obj.hasOwnProperty('__descendants__')) {
			obj.__descendants__._plainForEach_(self);
		}
	});
	return postponed;
};

turnMultiples = function (object, proto, postponed) {
	var old, nu;
	if (object.hasOwnProperty('__multiples__')) {
		old = getPrototypeOf(object.__multiples__);
		nu = proto.__multiples__;
		if (old === nu) return postponed;
		setPrototypeOf(object.__multiples__, nu);
		return turnMultiple(object, nu, postponed);
	}
	if (!object.hasOwnProperty('__descendants__')) return postponed;
	object.__descendants__._plainForEach_(function (object) {
		turnMultiples(object, proto, postponed);
	});
	return postponed;
};

turnMultiple = function (object, proto, postponed, done) {
	keys(object.__multiples__).forEach(function (sKey) {
		var setData = this[sKey], old, nu;
		if (!done) done = create(null);
		else if (done[sKey]) return;
		old = getPrototypeOf(setData);
		nu = proto[sKey] || null;
		done[sKey] = true;
		if (old === nu) return;
		setPrototypeOf(setData, nu);
		postponed = turnItems(object, sKey, nu, postponed);
	}, object.__multiples__);
	if (!object.hasOwnProperty('__descendants__')) return postponed;
	object.__descendants__._plainForEach_(function self(object) {
		if (object.hasOwnProperty('__multiples__')) {
			postponed = turnMultiple(object, proto, postponed, done && create(done));
			return;
		}
		if (object.hasOwnProperty('__descendants__')) {
			object.__descendants__._plainForEach_(self);
		}
	});
	return postponed;
};

turnItems = function (object, pSKey, proto, postponed, done) {
	keys(object.__multiples__[pSKey]).forEach(function (sKey) {
		var item = this[sKey], old, nu;
		if (!done) done = create(null);
		else if (done[sKey]) return;
		old = getPrototypeOf(item);
		nu = (proto && proto[sKey]) || object.__itemPrototype__;
		done[sKey] = true;
		if (old === nu) return;
		if (!nu._pSKey_ && item._pSKey_ && !item.hasOwnProperty('_pSKey_')) {
			defineProperties(item, {
				key: d('', item.key),
				_pSKey_: d('', item._pSKey_),
				_sKey_: d('', item._sKey_),
				_create_: d(item._create_)
			});
		}
		postponed = turn(item, nu, old, postponed);
	}, object.__multiples__[pSKey]);
	if (!object.hasOwnProperty('__descendants__')) return postponed;
	object.__descendants__._plainForEach_(function self(object) {
		if (object.hasOwnProperty('__multiples__')) {
			if (hasOwnProperty.call(object.__multiples__, pSKey)) {
				postponed = turnItems(object, pSKey, proto, postponed,
					done && create(done));
				return;
			}
		}
		if (object.hasOwnProperty('__descendants__')) {
			object.__descendants__._plainForEach_(self);
		}
	});
	return postponed;
};

turnReverse = function (object, proto) {
	var old, nu;
	if (object.hasOwnProperty('__reverseMaps__')) {
		old = getPrototypeOf(object.__reverseMaps__);
		nu = proto.__reverseMaps__ || null;
		if (old === nu) return;
		setPrototypeOf(object.__reverseMaps__, nu);
		return;
	}
	if (object.hasOwnProperty('__descendants__')) {
		object.__descendants__._plainForEach_(function (object) { turnReverse(object, proto); });
	}
};

turn = function (obj, nu, old, postponed) {
	setPrototypeOf(obj, nu);
	if (!postponed) postponed = [];
	postponed.push(old.__descendants__);
	old.__descendants__._postponed_ += 1;
	old.__descendants__._delete(obj);
	if (nu.hasOwnProperty('__descendants__')) {
		postponed.push(nu.__descendants__);
		nu.__descendants__._postponed_ += 1;
	}
	nu._descendants_._add(obj);
	return postponed;
};

exports.object = function (obj, nu, postponed) {
	var old = getPrototypeOf(obj);
	if (nu === old) return;
	postponed = turn(obj, nu, old, postponed);
	if (isNested(obj) && !obj.__sKey__ && old.__sKey__) {
		defineProperties(obj, {
			key: d('', old.key),
			__sKey__: d('', old.__sKey__),
			_extendNested_: d(old._extendNested_)
		});
	}

	postponed = turnDescProto(obj, nu, postponed);
	postponed = turnDescMaps(obj, nu, old, postponed);
	postponed = turnMultiples(obj, nu, postponed);
	turnReverse(obj, nu);
	return postponed;
};

exports.descriptor = function (desc, nu, postponed) {
	var old = getPrototypeOf(desc);
	if (nu === old) return;
	postponed = turn(desc, nu, old, postponed);

	return turnDescPropMaps(desc, nu, postponed);
};
