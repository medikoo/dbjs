'use strict';

var last        = require('es5-ext/lib/Array/prototype/last')
  , d           = require('es5-ext/lib/Object/descriptor')
  , proto       = require('../_proto')
  , relation    = require('./')

  , defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties, keys = Object.keys

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
		defineProperties(item, {
			_key_: d('', key),
			_value: d('', value),
			__value: d('w', value),
			_update_: d(item.__update_.bind(item))
		});
		this.obj._ns.on('change', item._update_);
		defineProperty(this.obj, key, d('c', item));
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
			defineProperty(this.obj, this._key_, d('ce', this));
			++this.obj._count_;
			this.obj._lastValue_ = this._value;
			this.obj.emit('add', this._value, this);
		} else {
			if (!this.obj.propertyIsEnumerable(this._key_)) return;
			defineProperty(this.obj, this._key_, d('c', this));
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
