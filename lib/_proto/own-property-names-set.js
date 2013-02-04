'use strict';

var d           = require('es5-ext/lib/Object/descriptor')
  , startsWith  = require('es5-ext/lib/String/prototype/starts-with')
  , ParentSet   = require('./object-set')
  , proto       = require('./')

  , defineProperty = Object.defineProperty
  , getOwnPropertyNames = Object.getOwnPropertyNames
  , metaChangers = { required: true, ns: true }
  , NamesSet;

var metaNames = { __$construct: true, __validateConstruction: true,
	__toString: true };

module.exports = NamesSet = function (obj) {
	ParentSet.call(this, obj);

	getOwnPropertyNames(obj).forEach(function (name) {
		var rel;
		if (!startsWith.call(name, '__')) return;
		if (metaNames.hasOwnProperty(name)) return;
		if ((name === '__value') || !(rel = this.obj[name]) ||
				(rel._type_ !== 'relation')) {
			return;
		}
		if (rel._value && (typeof rel._value === 'function') &&
				rel._value.hasOwnProperty('_overridenValue_')) {
			return;
		}
		name = name.slice(2);
		if (this._filter(name)) {
			this[this._serialize(name)] = name;
			++this.count;
		}
	}, this);
	obj.on('update', this._onupdate.bind(this));
};

NamesSet.prototype = Object.create(ParentSet.prototype, {
	constructor: d(NamesSet),
	_serialize: d(function (name) { return ':' + name; }),
	_filter: d(function (name) {
		var rel = this.obj['__' + name]
		  , required = rel.hasOwnProperty('__required') &&
				rel.__required.hasOwnProperty('_value') && rel.__required._value
		  , ns = rel.hasOwnProperty('__ns') && rel.__ns.hasOwnProperty('_value') &&
				(rel.__ns._value._id_ !== 'Base')
		  , value = rel.hasOwnProperty('_value');
		return required || ns || value;
	}),
	_onupdate: d(function (event) {
		var name, metaName;
		if (event.obj.obj !== this.obj) {
			if (event.obj.obj.obj !== this.obj) return;
			if (!metaChangers.hasOwnProperty(event.obj.name)) return;
			name = event.obj.obj.name;
		} else {
			name = event.obj.name;
		}
		metaName = this._serialize(name);
		if (this._filter(name)) {
			if (this.hasOwnProperty(metaName)) return;
			this[metaName] = name;
			++this.count;
			this.emit('add', name);
		} else if (this.hasOwnProperty(metaName)) {
			delete this[metaName];
			--this.count;
			this.emit('delete', name);
		}
	})
});

defineProperty(proto, 'getOwnPropertyNames', d(function () {
	if (!this.hasOwnProperty('_ownPropertyNames_')) {
		defineProperty(this, '_ownPropertyNames_', d(new NamesSet(this)));
	}
	return this._ownPropertyNames_;
}));
