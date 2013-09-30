'use strict';

var forEach  = require('es5-ext/object/for-each')
  , d        = require('d/d')
  , autoBind = require('d/auto-bind')
  , ee       = require('event-emitter/lib/core')

  , Fragment;

Fragment = function (fragment, filter) {
	this.fragment = fragment;
	this.filter = filter;
	this.valid = {};
	this.objects = {};
	forEach(this.fragment.objects, function (obj) {
		this._onUpdate(obj._lastEvent_);
	}, this);
	this.fragment.on('update', this._onUpdate);
	this.fragment.on('remove', this._onRemove);
};

ee(Object.defineProperties(Fragment.prototype, autoBind({
	_onUpdate: d(function (event, old) {
		var obj = event.obj, id = obj._id_;
		if (!this.valid.hasOwnProperty(id)) this.valid[id] = this.filter(obj);
		if (!this.valid[id]) return;
		this.objects[obj._id_] = obj;
		this.emit('update', event, old);
	}),
	_onRemove: d(function (id) {
		if (!this.objects[id]) return;
		delete this.objects[id];
		this.emit('remove', id);
	})
})));

module.exports = function (fragment, filter) {
	return new Fragment(fragment, filter);
};
