'use strict';

var isFunction = require('es5-ext/lib/Function/is-function')
  , d          = require('es5-ext/lib/Object/descriptor')
  , uuid       = require('time-uuid')
  , Base       = require('./base')

  , slice = Array.prototype.slice
  , defineProperties = Object.defineProperties

  , nameRe = /^[a-z][0-9a-zA-Z]*$/

  , ObjectType, proto, rel;

module.exports = ObjectType = defineProperties(Base.$$create('Object'), {
	_childType_: d('c', 'object'),
	newNamed: d('c', function (name, value) {
		var error, args, obj;
		if (!nameRe.test(name)) throw new Error(name + " is invalid name");
		if (ObjectType.hasOwnProperty(name)) {
			throw new Error(name + " is already taken");
		}
		args = slice.call(arguments, 1);
		error = this.prototype.validateConstruction.apply(this, args);
		if (error) throw error;

		obj = this.prototype.$$create(name);
		obj._signal_(this.prototype);
		obj.$construct.apply(obj, args);
		return obj;
	}),
	_serialize_: d('c', function (value) { return '7' + value._id_; })
});

ObjectType._$construct.$$setValue(function (construct, objProps, nsProps) {
	if (!isFunction(construct)) {
		nsProps = objProps;
		objProps = construct;
	} else if (!objProps) {
		objProps = { $construct: construct };
	} else {
		objProps.$construct = construct;
	}
	return Base.$construct.call(this, nsProps, objProps);
});
ObjectType._validateConstruction.$$setValue(
	function (construct, objProps, nsProps) {
		if (!isFunction(construct)) {
			nsProps = objProps;
			objProps = construct;
		} else if (!objProps) {
			objProps = { $construct: construct };
		} else {
			objProps.$construct = construct;
		}
		return Base.validateConstruction.call(this, nsProps, objProps);
	}
);
ObjectType._is.$$setValue(function (value) {
	var id;
	if (!value) return false;
	if (value._type_ !== 'object') return false;
	id = value._id_;
	return (this.propertyIsEnumerable(id) && (this[id] === value)) || false;
});
ObjectType._normalize.$$setValue(function (value) {
	return this.is(value) ? value : null;
});

proto = defineProperties(ObjectType.prototype, {
	$create: d(function (value) {
		var obj = this.$$create(uuid());
		obj._signal_(this);
		obj.$construct.apply(obj, arguments);
		return obj;
	}),
	validateCreate: d(function (value) {
		if (this.ns.is(value)) return null;
		return this.validateConstruction.apply(this, arguments);
	})
});
rel = proto._$construct;
rel.$$setValue(function (props) {
	if (props) this.$setProperties(props);
});
rel._required.$$setValue(true);

rel = proto._validateConstruction;
rel.$$setValue(function (props) {
	var error = (props != null) && this.validateCreateProperties(props);
	if (error) {
		error.message = "Invalid properties";
		return error;
	}
	return null;
});
rel._required.$$setValue(true);
