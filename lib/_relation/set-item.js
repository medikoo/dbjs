'use strict';

var d           = require('es5-ext/lib/Object/descriptor')
  , proto       = require('../_proto').prototype
  , relation    = require('./')

  , defineProperties = Object.defineProperties

  , item;

item = defineProperties(proto.$$create(':#'), {
	_type_: d('relation-set-item'),
	$$create: d(function (rel, key) {
		var item;
		if (key == null) key = '';
		item = proto.$$create.call(this, rel._id_ + ':' + key + '"');
		defineProperties(item, {
			obj: d('c', rel),
			_key_: d('c', key),
			_value: d('w', null)
		});
		return item;
	}),
	value: d.gs(function () {
		var value = this._value;
		return (value == null) ? value : this.obj.ns.normalize(value);
	}),
	delete: d(function () {
		this.obj._assertSet_();
		if (this._value == null) return;
		if ((this.obj._count_ === 1) && this.obj.required &&
				this.obj.hasOwnProperty('_value')) {
			throw new TypeError('Cannot remove the only value');
		}
		this.obj.$$delete(this._value);
		this._signal_();
	})
});

defineProperties(relation, {
	__setItem_: d('', item),
	_setItem_: d.gs(function () {
		if (!this.hasOwnProperty('__setItem_')) {
			this._fillRelationChain_('__setItem_');
		}
		return this.__setItem_;
	})
});
