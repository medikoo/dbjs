'use strict';

var last        = require('es5-ext/lib/Array/prototype/last')
  , d           = require('es5-ext/lib/Object/descriptor')
  , proto       = require('../_proto')
  , relation    = require('./')

  , defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties, keys = Object.keys
  , descriptorCreate = {
	_key_: { configurable: false, enumerable: false, writable: false },
	_value: { configurable: false, enumerable: false, writable: false },
	__value: { configurable: false, enumerable: false, writable: true },
	_update_: { configurable: true, enumerable: false, writable: true }
}, descriptorC = { configurable: true, enumerable: false, writable: false }
  , descriptorCE = { configurable: true, enumerable: true, writable: false }

  , item;

item = defineProperties(proto.$$create(':"'), {
	_type_: d('relation-set-item'),
	$$create: d(function (rel) {
		var item;
		item = proto.$$create.call(this, rel._id_ + ':"');
		defineProperty(item, 'obj', d('', rel));
		defineProperty(rel, '__itemPrototype_', d('', item));
		return item;
	}),
	$$createItem: d(function (key, value) {
		var item;
		item = proto.$$create.call(this, this.obj._id_ + ':' + key + '"');

		descriptorCreate._key_.value = key;
		descriptorCreate._value.value = descriptorCreate.__value.value = value;
		descriptorCreate._update_.value = item.__update_.bind(item);
		defineProperties(item, descriptorCreate);

		this.obj._ns.on('change', item._update_);
		if (value && (value._type_ === 'object')) {
			value.on('selfupdate', item._update_);
		}
		descriptorC.value = item;
		defineProperty(this.obj, key, descriptorC);
		descriptorC.value = null;
		return item;
	}),
	value: d.gs(function () { return this.__value; }),
	__update_: d(function () {
		this.__value = this.obj.ns.normalize(this._value);
	}),
	$$setValue: d(function (value) {
		var lastValue;
		if (value) {
			if (this.obj.propertyIsEnumerable(this._key_)) return;

			descriptorCE.value = this;
			defineProperty(this.obj, this._key_, descriptorCE);
			descriptorCE.value = null;

			++this.obj._count_;
			this.obj._lastValue_ = this._value;
			this.obj.emit('add', this._value, this);
		} else {
			if (!this.obj.propertyIsEnumerable(this._key_)) return;

			descriptorC.value = this;
			defineProperty(this.obj, this._key_, descriptorC);
			descriptorC.value = null;

			--this.obj._count_;
			if (this.obj._lastValue_ === this._value) {
				lastValue = this.obj[last.call(keys(this.obj))];
				this.obj._lastValue_ = lastValue ? lastValue._value : null;
			}
			this.obj.emit('delete', this._value, this);
		}
	}),
	delete: d(function () {
		var defined;
		this.obj._assertSet_();
		defined = this.obj.propertyIsEnumerable(this._key_);
		if (defined && (this.obj._count_ === 1) && this.obj.required &&
				this.obj.hasOwnProperty('_value')) {
			throw new TypeError('Cannot remove the only value');
		}
		this.$delete();
		if (!defined) this._signal_();
	}),
	$delete: d(function () {
		this._forEachRelation_(function (rel) { rel.$delete(); });
		if (this.obj.propertyIsEnumerable(this._key_)) this._signal_();
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
