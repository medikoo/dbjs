'use strict';

var someRight   = require('es5-ext/lib/Array/prototype/some-right')
  , d           = require('es5-ext/lib/Object/descriptor')
  , proto       = require('../_proto')
  , relation    = require('./')

  , defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , getPrototypeOf = Object.getPrototypeOf, keys = Object.keys
  , descriptorProtoCreate = {
	obj: { configurable: false, enumerable: false, writable: false },
	_root_: { configurable: false, enumerable: false, writable: false }
}, descriptorCreate = {
	_key_: { configurable: false, enumerable: false, writable: false },
	_value: { configurable: false, enumerable: false, writable: true },
	__value: { configurable: false, enumerable: false, writable: true,
			value: false },
	_subject_: { configurable: false, enumerable: false, writable: false },
	__subject_: { configurable: false, enumerable: false, writable: true },
	_update_: { configurable: true, enumerable: false, writable: true }
}, descriptor = { configurable: false, enumerable: false, writable: false }
  , descriptorC = { configurable: true, enumerable: false, writable: false }
  , descriptorCE = { configurable: true, enumerable: true, writable: false }

  , item;

item = defineProperties(proto.$$create(':"'), {
	_type_: d('relation-set-item'),
	$$create: d(function (rel) {
		var item;
		item = proto.$$create.call(this, rel._id_ + ':"');
		descriptorProtoCreate.obj.value = rel;
		descriptorProtoCreate._root_.value = rel._root_;
		defineProperties(item, descriptorProtoCreate);

		descriptor.value = item;
		defineProperty(rel, '__itemPrototype_', descriptor);
		delete descriptor.value;

		return item;
	}),
	$$createItem: d(function (key, subject) {
		var item;
		item = proto.$$create.call(this, this.obj._id_ + ':' + key + '"');

		descriptorCreate._key_.value = key;
		descriptorCreate._subject_.value = subject;
		descriptorCreate.__subject_.value = this.obj.ns.normalize(subject);
		descriptorCreate._update_.value = item.__update_.bind(item);
		defineProperties(item, descriptorCreate);

		item._update_();

		descriptorC.value = item;
		defineProperty(this.obj, key, descriptorC);
		descriptorC.value = null;

		this.obj._ns.on('change', this._subjectUpdate_.bind(this));
		item._watchRel();
		return item;
	}),
	_watchRel: d(function () {
		var listener, current;
		current = this.obj.hasOwnProperty('_value');
		this.obj.on('selfupdate', listener = function () {
			if (current === this.obj.hasOwnProperty('_value')) return;
			if (this !== proto) {
				if (!current) this._watchParentRel();
				else this._unwatchParentRel();
			}
			current = !current;
			this._update_();
		}.bind(this));
		defineProperty(this, '_relListener_', d(listener));
		if (!this.obj.hasOwnProperty('_value')) this._watchParentRel();
	}),
	_unwatchRel: d(function () {
		if (!this.obj.hasOwnProperty('_value')) this._unwatchParentRel();
		this.obj.off('selfupdate', this._relListener_);
		delete this._relListener_;
	}),
	_watchParentRel: d(function () {
		var listener, obj = getPrototypeOf(this.obj);
		obj._multiple.on('change', listener = function (value) {
			if (value) obj._getItem_(this._key_).on('change', this._update_);
			else obj._getItem_(this._key_).off('change', this._update_);
			this._update_();
		}.bind(this));
		defineProperty(this, '_parentRelListener_', d(listener));
		if (obj.multiple) obj._getItem_(this._key_).on('change', this._update_);
		if (!this._root_) return;
		this._root_.on('selfupdate', listener = function () {
			var nu = getPrototypeOf(this.obj);
			if (nu === obj) return;
			if (obj.multiple) obj._getItem_(this._key_).off('change', this._update_);
			obj._multiple.off('change', listener);
			nu._multiple.on('change', listener);
			if (nu.multiple) nu._getItem_(this._key_).on('change', this._update_);
			this._update_();
		}.bind(this));
		defineProperty(this, '_rootListener_', d(listener));
	}),
	_unwatchParentRel: d(function () {
		var obj = getPrototypeOf(this.obj);
		if (obj.multiple) obj._getItem_(this._key_).off('change', this._update_);
		obj._multiple.off('change', this._parentRelListener_);
		delete this._parentRelListener_;
		if (!this._root_) return;
		this._root_.off('selfupdate', this._rootListener_);
		delete this._rootListener_;
	}),
	value: d.gs(function () { return this.__value; }, function (value) {
		this._signal_((value == null) ? undefined : Boolean(value));
	}),
	_subjectUpdate_: d(function () {
		var old = (this.__subject_ != null), nu;
		this.__subject_ = this.obj.ns.normalize(this._subject_);
		nu = (this.__subject != null);
		if ((this._value != null) && (nu !== old)) this.obj._count_ += nu ? 1 : -1;
		this._update_();
	}),
	__update_: d(function () {
		var old = this.__value, parent, lastValue;
		if (this.__subject_ == null) {
			this.__value = false;
		} else if (this._value != null) {
			this.__value = this._value;
		} else if (this.obj.hasOwnProperty('_value')) {
			this.__value = false;
		} else if (this.obj === proto) {
			this.__value = false;
		} else if (!(parent = getPrototypeOf(this.obj)).multiple) {
			this.__value = false;
		} else {
			this.__value = parent._getItem_(this._key_, this._subject_).value;
		}
		if (this.__value) this.obj._lastValue_ = this._subject_;
		if (old === this.__value) return;
		if (!this.__value && (this.obj._lastValue_ === this._subject_)) {
			someRight.call(keys(this.obj), function (key) {
				lastValue = this[key];
				if (lastValue._value) return true;
				lastValue = null;
				return false;
			}, this.obj);
			this.obj._lastValue_ = lastValue ? lastValue._subject_ : null;
		}
		this.emit('change', this.__value, old);
		if (this.__value) this.obj.emit('add', this._subject_);
		else this.obj.emit('delete', this._subject_);
		if (this.obj.hasOwnProperty('_children_')) this._propagateEvent_(this.obj);
	}),
	_propagateEvent_: d(function (obj) {
		var ns = obj.ns;
		obj._children_.forEach(function (obj) {
			if (obj._type_ !== 'relation') return;
			if (obj.hasOwnProperty('_value')) return;
			if (!obj.__multiple.__value) return;
			if (obj.hasOwnProperty(this._key_)) return;
			if ((obj.ns !== ns) && (obj.ns.normalize(this._subject_) == null)) return;
			obj.emit(this.__value ? 'add' : 'delete', this._subject_);
			if (obj.hasOwnProperty('_children_')) this._propagateEvent_(obj);
		}, this);
	}),
	subject: d.gs(function () { return this.__subject_; }),
	$$setValue: d(function (value) {
		if (this._value === value) return;
		if (value) {
			descriptorCE.value = this;
			defineProperty(this.obj, this._key_, descriptorCE);
			descriptorCE.value = null;
			if (this.__subject_ != null) ++this.obj._count_;
		} else if (this._value === true) {
			descriptorC.value = this;
			defineProperty(this.obj, this._key_, descriptorC);
			descriptorC.value = null;
			if (this.__subject_ != null) --this.obj._count_;
		}
		this._value = value;
		this._update_();
	}),
	delete: d(function () {
		var defined;
		this.obj._assertSet_();
		defined = this._value;
		if (defined && (this.obj._count_ === 1) && this.obj.required &&
				this.obj.hasOwnProperty('_value')) {
			throw new TypeError('Cannot remove the only value');
		}
		this.$delete();
		if (defined == null) this._signal_();
	}),
	$delete: d(function () {
		this._forEachRelation_(function (rel) { rel.$delete(); });
		if (this._value != null) this._signal_();
	})
});

defineProperties(relation, {
	__itemPrototype_: d('', item),
	_itemPrototype_: d.gs(function () {
		if (!this.hasOwnProperty('__itemPrototype_')) {
			this._fillRelationChain_('__itemPrototype_');
		}
		return this.__itemPrototype_;
	})
});
