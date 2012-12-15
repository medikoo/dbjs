'use strict';

var remove         = require('es5-ext/lib/Array/prototype/remove')
  , i              = require('es5-ext/lib/Function/i')
  , d              = require('es5-ext/lib/Object/descriptor')
  , startsWith     = require('es5-ext/lib/String/prototype/starts-with')
  , endsWith       = require('es5-ext/lib/String/prototype/ends-with')
  , Plain          = require('./plain')
  , isNamespace    = require('./is-namespace')
  , nameRe         = require('./name-re')
  , RelSetReadOnly = require('./rel-set-read-only')
  , UniqueIndex    = require('./unique-index')
  , dummyNs        = require('./dummy-ns')

  , isArray = Array.isArray
  , defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , getOwnPropertyNames = Object.getOwnPropertyNames
  , getPrototypeOf = Object.getPrototypeOf
  , isDigit = RegExp.prototype.test.bind(/\d/)

  , Relation, Item, Constructor, define, signal, history, reverse, refresh
  , addTriggers, removeTriggers;

addTriggers = function (rel) {
	var ontriggeradd, ontriggerdelete, onadd, ondelete, name, obj, objects
	  , subSetup;
	obj = rel.obj;
	name = '_' + rel.name;
	onadd = function self(obj) {
		var rel = obj[name];
		if (rel.hasOwnProperty('_value')) return;
		rel._triggersSetup_ = subSetup;
		objects.push(obj);
		obj.on('add', onadd);
		obj.on('delete', ondelete);
		rel.triggers.forEach(function (triggerName) {
			obj['_' + triggerName].on('update', obj[name]._refresh_);
		});
		if (obj.hasOwnProperty('_children_')) obj._children_.forEach(self);
	};
	ondelete = function self(obj) {
		var rel = obj[name];
		if (!rel.hasOwnProperty('_triggersSetup_')) return;
		delete rel._triggersSetup_;
		remove.call(objects, obj);
		obj.off('add', onadd);
		obj.off('delete', ondelete);
		rel.triggers.forEach(function (triggerName) {
			obj['_' + triggerName].off('update', obj[name]._refresh_);
		});
		if (obj.hasOwnProperty('_children_')) obj._children_.forEach(self);
	};
	rel.triggers.forEach(function (triggerName) {
		if (!obj['_' + triggerName]) define(obj, triggerName);
	});
	rel.triggers.on('add', ontriggeradd = function (triggerName) {
		triggerName = '_' + triggerName;
		objects.forEach(function self(obj) {
			obj[triggerName].on('update', obj[name]._refresh_);
		});
	});
	rel.triggers.on('delete', ontriggerdelete = function (triggerName) {
		triggerName = '_' + triggerName;
		objects.forEach(function self(obj) {
			obj[triggerName].off('update', obj[name]._refresh_);
		});
	});

	subSetup = { onadd: onadd, ondelete: ondelete };
	defineProperty(rel, '_triggersSetup_',
		d({ ontriggeradd: ontriggeradd, ontriggerdelete: ontriggerdelete,
			onadd: onadd, ondelete: ondelete }));
	objects = [obj];
	obj.on('add', onadd);
	obj.on('delete', ondelete);
	rel.triggers.forEach(function (triggerName) {
		obj['_' + triggerName].on('update', rel._refresh_);
	});
	if (obj.hasOwnProperty('_children_')) obj._children_.forEach(onadd);
};

removeTriggers = function (rel) {
	var setup = rel._triggersSetup_, obj = rel.obj;
	if (setup.ontriggeradd) rel.triggers.off('add', setup.ontriggeradd);
	if (setup.ontriggerdelete) rel.triggers.off('delete', setup.ontriggerdelete);
	setup.ondelete(obj);
};

refresh = function () {
	var nu = this._value, old = this.__value, name;
	if ((typeof nu === 'function') && !nu._id_) {
		if (nu.length || (!this.triggers.count && !this.fixedValue)) {
			this.__value = nu;
			if (this.hasOwnProperty('_triggersSetup_')) removeTriggers(this);
			return;
		} else {
			nu = this.__value = this.ns.normalize(nu.call(this.obj));
			if (this.hasOwnProperty('_value')) {
				if (this.fixedValue) {
					if (this.hasOwnProperty('_triggersSetup_')) removeTriggers(this);
				} else if (!this.hasOwnProperty('_triggersSetup_')) {
					addTriggers(this);
				} else if (this._triggersSetup_.onadd) {
					if (this.hasOwnProperty('_children_')) {
						name = '_' + this.name;
						this._children_.forEach(function self(obj) {
							var rel = obj[name];
							if (rel.hasOwnProperty('_value')) return;
							rel._refresh_();
							if (obj.hasOwnProperty('_children_')) obj.forEach(self);
						});
					}
				} else {
					removeTriggers(this);
					addTriggers(this);
				}
			} else if (this.hasOwnProperty('_triggersSetup_')) {
				if (this._triggersSetup_.onadd) {
					removeTriggers(this);
					if (this._triggersSetup_) this._triggersSetup_.onadd(this.obj);
				}
			} else if (this._triggersSetup_) {
				this._triggersSetup_.onadd(this.obj);
			}
		}
	} else {
		nu = this.__value = (nu == null) ? nu : this.ns.normalize(nu);
		if (this.hasOwnProperty('_triggersSetup_')) removeTriggers(this);
	}
	if (old !== nu) this.emit('update', nu, old);
};

module.exports = Relation = Plain.create(function (obj, name, descriptor) {
	defineProperties(this, {
		obj: d('', obj),
		name: d.gs('', function () { return name; }),
		_id_: d('', obj._id_ + ':' + name),
		_foreign_: d('w', null),
		_descriptor_: d('', descriptor),
		__value: d('w', undefined),
		_refresh_: d(refresh.bind(this))
	});
	this._ns.on('update', this._refresh_);
});

Constructor = function (obj, parent) {
	defineProperties(this, {
		obj: d('', obj),
		_id_: d('', obj._id_ + ':' + this.name),
		_foreign_: d('w', null),
		__value: d('w', this.__value),
		_refresh_: d(refresh.bind(this))
	});
	this._ns.on('update', this._refresh_);
	parent.on('update', this._refresh_);
};

defineProperties(Relation.prototype, {
	_id_: d(''),
	_create_: d(function (obj) {
		var rel;
		// Avoid Object.create for performance reasons
		Constructor.prototype = this;
		rel = new Constructor(obj, this);
		if (!this.hasOwnProperty('_children_')) {
			defineProperty(this, '_children_', d('', []));
		}
		this._children_.push(rel);
		return rel;
	}),
	_onOld_: d(function (value) {
		if (this.unique) this._uniqIndex_.remove(this, value);
		if (value && value._id_ && value.ns) reverse.remove(this, value);
	}),
	_onNew_: d(function (value) {
		if (this.unique) this._uniqIndex_.add(this, value);
		if (value && value._id_ && value.ns) reverse.add(this, value);
	}),
	_forEachObject_: d(function (cb) {
		getOwnPropertyNames(this).forEach(function (name) {
			var value;
			if (startsWith.call(name, '__')) {
				if (name === '__value') return;
				value = this[name];
				if (!value._id_) return;
				if (!value.hasOwnProperty('_value')) return;
			} else if (isDigit(name[0]) && this.propertyIsEnumerable(name)) {
				value = this[name];
				if (!value || !value._id_ || !endsWith.call(value._id_, '"')) return;
			} else {
				return;
			}
			cb(value, value._id_, this);
		}, this);
	}),
	_objectValue_: d.gs(function () {
		var value = this.value, type;
		if (value == null) return value;
		type = typeof value;
		if ((type === 'object') || (type === 'function')) return value;
		value = Object(value);
		value.__proto__ = this.ns.prototype;
		return value;
	}),
	value: d.gs(function () {
		var value = this.__value;
		if ((typeof value === 'function') && !value._id_) {
			if (value.length) return value;
			value = value.call(this.obj);
			if (this.multiple) return new RelSetReadOnly(this.ns, value);
			return (value == null) ? null : this.ns.normalize(value);
		}
		if (this.multiple) {
			if (!this.hasOwnProperty('_count_')) this._initSet_();
			return this;
		}
		return value;
	}, function self(value) {
		var error = this.validate(value);
		if (error) throw error;
		this.$setValue(value);
	}),
	$setValue: d(function (value) {
		if (this.hasOwnProperty('_count_')) {
			this._reset_(value);
			return;
		} else if (this.multiple) {
			this._initSet_();
			this._reset_(value);
			return;
		}
		if ((value == null) || ((typeof value === 'function') && !value._id_)) {
			this.$$setValue(value);
			signal(this, value);
			return;
		}
		if (isArray(value)) {
			this._initSet_();
			this._reset_(value);
			return;
		}
		value = this.ns.is(value) ? value : this.ns.prototype.$create(value);
		this.$$setValue(value);
		signal(this, value);
	}),
	$$setValue: d(function (value) {
		var oldValue;

		if (!this.hasOwnProperty('_descriptor_')) {
			if ((value !== undefined) &&
				(!this.obj.hasOwnProperty(this.name) || this._foreign_)) {
				defineProperty(this.obj, this.name, this._descriptor_);
			} else if (!this._foreign_) {
				delete this.obj[this.name];
			}
			if (this._foreign_) this._foreign_ = null;
		}

		oldValue = this.hasOwnProperty('_value') ? this._value : undefined;
		if (value === undefined) {
			if (this.hasOwnProperty('_value')) {
				delete this._value;
				getPrototypeOf(this).on('update', this._refresh_);
			}
		} else if (!this.hasOwnProperty('_value')) {
			defineProperty(this, '_value', d('cw', value));
			getPrototypeOf(this).off('update', this._refresh_);
		} else {
			this._value = value;
		}

		if ((typeof oldValue === 'function') && !oldValue._id_) oldValue = null;
		if ((typeof value === 'function') && !value._id_) value = null;

		if (oldValue !== value) {
			if (oldValue !== null) this._onOld_(oldValue);
			if (value !== null) this._onNew_(value);
		}
		this._refresh_();
	}),
	find: d(function (value) {
		var obj;
		if (!this.hasOwnProperty('_children_')) return null;
		value = this.ns.normalize(value);
		if (value == null) return null;
		this._children_.some(function self(child) {
			if (child._value === value) {
				obj = child.obj;
				return true;
			}
			if (child.hasOwnProperty('_children_')) {
				return child._children_.some(self);
			}
		});
		return obj || null;
	}),
	_validate_: d(function (original) {
		var key, error, ns = this.ns, value;
		if ((typeof original === 'function') && !original._id_) {
			return new TypeError(original + " is not valid " + ns._id_);
		}
		value = ns.coerce(original);
		if (value == null) {
			return new TypeError(original + " is not valid " + ns._id_);
		}
		if ((error = ns.validate(value))) return error;
		if (!(key = ns._serialize_(value))) {
			return new TypeError(original + " is not valid dbjs value");
		}
		if (this.unique && (error = this._uniqIndex_.validate(this, key, value))) {
			return error;
		}
		return null;
	}),
	_validateValues_: d(function (values) {
		var error, errors;
		values.forEach(function (value) {
			if ((error = this._validate_(value))) {
				if (!errors) errors = [];
				errors.push(error);
			}
		}, this);
		return errors;
	}),
	validate: d(function (value) {
		var error, errors;
		if (this.writeOnce && (this._value != null)) {
			return new TypeError("Property is read-only");
		}
		if (value === undefined) {
			if (this.required && (getPrototypeOf(this)._value == null)) {
				return new TypeError((this.label || this.name) + " is required");
			}
			return null;
		}
		if (value === null) {
			if (this.required) {
				return new TypeError((this.label || this.name) + " is required");
			}
			return null;
		}
		if ((typeof value === 'function') && !value._id_) return null;

		if (isArray(value)) {
			if (!this.multiple) {
				return new TypeError(value + " is not valid " + this.ns._id_);
			}
			if (!value.length) {
				if (!this.required) return null;
				return new TypeError(value + " is not valid " + this.ns._id_);
			}
			if ((errors = this._validateValues_(value))) {
				error = new TypeError(value + " contains invalid values");
				error.errors = errors;
				return error;
			}
			return null;
		}
		return this._validate_(value);
	})
});

define = require('./define-basic');

define(Relation.prototype, 'required', false);
define(Relation.prototype, 'multiple', false);
define(Relation.prototype, 'writeOnce', false);

define(Relation.prototype, 'unique', false);
defineProperties(Relation.prototype.__unique, {
	$$setValue: d(function (value) {
		if (value) {
			if (!this.hasOwnProperty('_value')) {
				defineProperty(this.obj, 'unique', this._descriptor_);
			}
			if (this._value) {
				this._value = true;
				return;
			}
			this._value = true;
			defineProperty(this.obj, '_uniqIndex_',
				d('c', new UniqueIndex(this.obj)));
		} else {
			if (!this._value) return;
			delete this._value;
			delete this.obj.unique;
			delete this.obj._uniqIndex_;
			if (this.obj.hasOwnProperty('_children_')) {
				this.obj._children_.forEach(function self(child) {
					if (child.unique) {
						defineProperty(child, '_uniqIndex_',
							d('c', new UniqueIndex(child)));
					} else if (child.hasOwnProperty('_children_')) {
						child._children_.forEach(self);
					}
				});
			}
		}
		this._refresh_();
	}),
	validate: d(function (value) {
		if (!value && this._value && !this.hasOwnProperty('_value')) {
			return new Error("Cannot override unique on extended namespace.");
		}
		return null;
	})
});

define(Relation.prototype, 'reverse', null);
defineProperties(Relation.prototype.__reverse, {
	value: d.gs(function () {
		return this.hasOwnProperty('_value') ? this._value : null;
	}, function self(value) {
		var error;
		value = this._normalize(value);
		if ((error = this.validate(value))) throw error;
		this.$$setValue(value);
		signal(this, value);
	}),
	_normalize: d(function (value) {
		if (value === true) {
			value = this.obj.obj.ns._id_;
			value = value[0].toLowerCase() + value.slice(1);
		} else if (value) {
			value = String(value);
		}
		return value;
	}),
	$$setValue: d(function (name) {
		if (!name) {
			if (this.hasOwnProperty('_value')) {
				reverse.unset(this.obj, this._value);
				delete this.obj.reverse;
				delete this._value;
			}
			return;
		}
		name = String(name);
		if ((name !== this._value) && this.hasOwnProperty('_value')) {
			reverse.unset(this.obj, this._value);
		}
		reverse.set(this.obj, name);
		if (!this.hasOwnProperty('_value')) {
			defineProperty(this.obj, 'reverse', this._descriptor_);
		}
		this._value = name;
	}),
	validate: d(function (name) {
		if (!name) return null;
		if (name === true) {
			name = this.obj.obj.ns._id_;
			name = name[0].toLowerCase() + name.slice(1);
		} else {
			name = String(name);
		}
		if (name === this._value) return null;
		if (!nameRe.test(name)) return new TypeError(name + " is not a valid name");
		return null;
	})
});

define(Relation.prototype, 'ns', dummyNs);
defineProperties(Relation.prototype.__ns, {
	_normalize: d(i),
	$$setValue: d(function (value) {
		var old = this._value, newValue, revName;
		if (value === null) value = Relation.prototype.ns;
		newValue = value;
		if (value === undefined) newValue = getPrototypeOf(this)._value;

		revName = this.obj.hasOwnProperty('reverse') && this.obj.reverse;
		if (revName && (old !== newValue)) reverse.unset(this.obj, revName);

		if (value === undefined) {
			delete this.obj.ns;
			delete this._value;
		} else {
			if (!this.hasOwnProperty('_value')) {
				defineProperty(this.obj, 'ns', this._descriptor_);
			}
			this._value = value;
		}

		if (old !== newValue) {
			if (revName) reverse.set(this.obj, revName);
			if (this.obj.unique) this.obj._uniqIndex_.updateNs(this.obj, old);
		}
		this._refresh_();
	}),
	validate: d(function (value) {
		if (value == null) return null;
		if (!isNamespace(value)) {
			return new TypeError(value + " is not a namespace object");
		}
		return null;
	})
});

require('./rel-set');
Item  = require('./rel-set-item');
reverse = require('./rel-reverse');
signal = require('./signal');
history = signal.history;
