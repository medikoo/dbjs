'use strict';

var copy        = require('es5-ext/lib/Array/prototype/copy')
  , isFunction  = require('es5-ext/lib/Function/is-function')
  , d           = require('es5-ext/lib/Object/descriptor')
  , callable    = require('es5-ext/lib/Object/valid-callable')
  , uuid        = require('time-uuid')
  , FilterSet   = require('../_proto/object-filter-set')
  , ObjectList  = require('../_proto/object-ordered-list')
  , readOnlySet = require('../utils/read-only-set').prototype
  , Base        = require('./base')

  , slice = Array.prototype.slice, call = Function.prototype.call
  , defineProperties = Object.defineProperties, keys = Object.keys
  , nameRe = /^[a-z][0-9a-zA-Z]*$/
  , ObjectType, proto, rel, byCreatedAt;

byCreatedAt = function (a, b) { return a._lastModified_ - b._lastModified_; };

module.exports = ObjectType = defineProperties(Base.$$create('Object'), {
	_childType_: d('c', 'object'),
	_isSet_: d(true),
	obj: d.gs(function () { return this; }),
	add: d(readOnlySet.add),
	has: d(function (obj) {
		if (!obj) return false;
		return (this.hasOwnProperty(obj._id_) && (this[obj._id_] === obj));
	}),
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
	_serialize_: d('c', function (value) { return '7' + value._id_; }),
	delete: d('c', function () {
		if (arguments.length) return readOnlySet.delete.call(this);
		if (this.hasOwnProperty('_children_')) {
			copy.call(this._children_).forEach(function (child) { child.delete(); });
		}
		if (this.prototype.hasOwnProperty('_children_')) {
			copy.call(this.prototype._children_).forEach(function (child) {
				if (child._type_ === 'object') child.delete();
			});
		}
		Base.delete.call(this);
	}),
	values: d.gs(function () {
		var values = [];
		keys(this).forEach(function (id) {
			var obj = this[id];
			if (obj && obj._type_ === 'object') values.push(obj);
		}, this);
		return values;
	}),
	forEach: d(function (cb/*, thisArg*/) {
		var thisArg = arguments[1];
		callable(cb);
		this.values.forEach(function (obj, index) {
			call.call(cb, thisArg, obj, obj._id_, this, index);
		}, this);
	}),
	listByCreatedAt: d(function () { return this.list(byCreatedAt); })
});
FilterSet.defineOn(ObjectType);
ObjectList.defineOn(ObjectType);

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
		if (value && value._type_ && value.hasOwnProperty('_id_')) {
			return new TypeError('Invalid object');
		}
		return this.validateConstruction.apply(this, arguments);
	}),
	delete: d(function () {
		if (this._type_ !== 'object') {
			throw new TypeError('Prototype cannot be deleted');
		}
		if (this.hasOwnProperty('_children_')) {
			copy.call(this._children_).forEach(function (child) { child.delete(); });
		}
		this._forEachRelation_(function (rel) { rel.$delete(); });
		this._signal_();
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
