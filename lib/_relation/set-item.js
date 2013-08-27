'use strict';

var someRight   = require('es5-ext/array/#/some-right')
  , d           = require('es5-ext/object/descriptor')
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
	_update_: { configurable: true, enumerable: false, writable: false },
}, descriptor = { configurable: false, enumerable: false, writable: false }
  , descriptorC = { configurable: true, enumerable: false, writable: false }
  , descriptorCE = { configurable: true, enumerable: true, writable: false }
  , objectType = { object: true, prototype: true, namespace: true }

  , item;

item = defineProperties(proto.$$create(':"'), {
	_type_: d('relation-set-item'),
	_value: d('w', undefined),
	__value: d('', undefined),
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
		descriptorCreate._update_.value = item.__update_.bind(item);
		defineProperties(item, descriptorCreate);

		descriptorC.value = item;
		defineProperty(this.obj, key, descriptorC);
		descriptorC.value = null;

		if (subject && subject.hasOwnProperty('_id_') &&
				objectType[subject._type_]) {
			subject.on('selfupdate', item._update_);
		}
		item._update_();
		return item;
	}),
	value: d.gs(function () { return this.__value; }, function (value) {
		this._signal_((value == null) ? undefined : Boolean(value));
	}),
	__update_: d(function (propagate) {
		var rel = this.obj, old = this.__value, nu, lastValue, baseRel, index;
		if (this.obj.__ns.__value.normalize(this._subject_) == null) {
			nu = false;
		} else if (this._value != null) {
			nu = this._value;
		} else {
			baseRel = rel;
			while (!baseRel.hasOwnProperty('_value')) {
				if ((baseRel = getPrototypeOf(baseRel))._type_ !== 'relation') {
					nu = false;
					break;
				}
				if (!baseRel._isSet_) {
					nu = false;
					break;
				}
				if (baseRel.hasOwnProperty(this._key_)) {
					nu = baseRel[this._key_].__value;
					break;
				}
			}
			if (nu == null) nu = false;
		}
		this.__value = nu;
		if (nu && this._value) rel._lastValue_ = this._subject_;
		if (old === nu) return;
		if (!nu && rel.hasOwnProperty('_lastValue_') &&
				(rel._lastValue_ === this._subject_)) {
			someRight.call(keys(rel), function (key) {
				lastValue = this[key];
				if (lastValue._value && lastValue.__value) return true;
				lastValue = null;
				return false;
			}, rel);
			rel._lastValue_ = lastValue ? lastValue._subject_ : null;
		}
		if (this._value) this.obj._count_ += nu ? 1 : -1;

		if ((nu || old) && ((index = this.obj._index_))) {
			if (old) index.delete(this._key_, this.obj.obj);
			else if (nu) index.add(this._key_, this.obj.obj);
		}

		if (propagate === false) return;
		this.emit('change', this.__value, old);
		if (this.__value) rel.emit('add', this._subject_, this, this._key_);
		else rel.emit('delete', this._subject_, this, this._key_);
		if (rel.hasOwnProperty('_children_')) this._propagateEvent_(rel);
	}),
	_propagateEvent_: d(function (rel) {
		var ns = rel.__ns.__value;
		rel._children_.forEach(function (child) {
			if (child._type_ !== 'relation') return;
			if (child.hasOwnProperty('_value')) return;
			if (!child._isSet_) return;
			if (child.hasOwnProperty(this._key_)) {
				child[this._key_]._update_();
				return;
			}
			if ((child.__ns.__value !== ns) &&
					(child.__ns.__value.normalize(this._subject_) == null)) {
				return;
			}
			child.emit(this.__value ? 'add' : 'delete', this._subject_, null,
					this._key_);
			if (child.hasOwnProperty('_children_')) this._propagateEvent_(child);
		}, this);
	}),
	subject: d.gs(function () { return this._subject_; }),
	$$setValue: d(function (value) {
		if (this._value === value) return;
		if (value) {
			descriptorCE.value = this;
			defineProperty(this.obj, this._key_, descriptorCE);
			descriptorCE.value = null;
		} else if (this._value === true) {
			descriptorC.value = this;
			defineProperty(this.obj, this._key_, descriptorC);
			descriptorC.value = null;
		}
		if (this.__value) {
			if (this._value) --this.obj._count_;
			else if (value) ++this.obj._count_;
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
