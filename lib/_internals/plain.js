'use strict';

var isFunction           = require('es5-ext/lib/Function/is-function')
  , d                    = require('es5-ext/lib/Object/descriptor')
  , forEach              = require('es5-ext/lib/Object/for-each')
  , nameRe               = require('./name-re')
  , validateCompleteness = require('./validate-completeness')

  , create = Object.create, defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties

  , Relation, define, abstractLock, Plain;

module.exports = Plain = defineProperties(function () {}, {
	create: d('c', function (constructor, nsProps, objProps) {
		var isAbstract = abstractLock;
		abstractLock = false;

		if (!isFunction(constructor)) {
			objProps = nsProps;
			nsProps = constructor;
			constructor = eval('(' + String(this) + ')');
		}
		constructor.__proto__ = this;
		constructor.prototype = create(this.prototype);
		defineProperty(constructor.prototype, 'constructor', d(constructor));

		if (nsProps) constructor.setMany(nsProps, '');
		if (!isAbstract) validateCompleteness(constructor);
		if (objProps) constructor.prototype.setMany(objProps, 'e');

		return constructor;
	}),
	abstract: d('c', function (name, constructor, nsProps, objProps) {
		abstractLock = true;
		try {
			return this.create.apply(this, arguments);
		} finally {
			abstractLock = false;
		}
	})
});

// Define relation
Relation = require('./relation');

define = require('./define');

define(Relation.prototype, 'required');
define(Relation.prototype, 'multiple');
define(Relation.prototype, 'validate');
Relation.prototype._required.value = false;
Relation.prototype._required.required = true;
Relation.prototype._multiple.value = false;
Relation.prototype._multiple.required = true;

// as we have relation defined, we need to define `set` methods:
define(Plain, 'set', function (name, value) {
	if (!nameRe.test(name)) {
		throw new Error("'" + name + "' is not valid property name");
	}

	if ((name in this) && (('_$' + name) in this)) { //jslint: skip
		// Defined value, set directly
		return (this[name] = value);
	}
	return define(this, name, value);
});
define(Plain, 'setMany', function (props) {
	forEach(props, function (value, name) { this.set(name, value); }, this);
});
define(Plain.prototype, 'set', Plain.set);
define(Plain.prototype, 'setMany', Plain.setMany);
