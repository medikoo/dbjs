// Join many fragments into one
// Use cases:
// - join fragments of all authenticated users for one client
// - join fragments of all objects for one authenticated user
// - join fragments of object and objects it is related to

'use strict';

var assign  = require('es5-ext/object/assign')
  , forEach = require('es5-ext/object/for-each')
  , d       = require('d/d')
  , ee      = require('event-emitter/lib/core')
  , memoize = require('memoizee/lib/primitive')
  , Es6Map  = require('es6-map')
  , objects = require('../../objects')

  , keys = Object.keys

  , Fragment;

require('memoizee/lib/ext/dispose');
require('memoizee/lib/ext/method');
require('memoizee/lib/ext/ref-counter');

module.exports = Fragment = function () {
	this.evented = {};
	this.objects = {};
	this.fragments = new Es6Map();
};

ee(Object.defineProperties(Fragment.prototype, assign({
	add: d(function (fragment) {
		var onupdate, addObject;

		addObject = memoize(this._addObject,
			{ force: true, dispose: this._addObject.clearRef });
		fragment.on('update', onupdate = function (event, old) {
			var obj = event.obj, id = obj._id_;
			addObject(id);
			if (!this.evented.hasOwnProperty(id) ||
					(this.evented[id] !== event.index)) {
				this.evented[id] = event.index;
				this.emit('update', event, old);
			}
		}.bind(this));
		fragment.on('remove', addObject.clear);
		forEach(fragment.objects, function (obj, id) {
			onupdate(obj._lastEvent_);
		});

		this.fragments.set(fragment, function () {
			fragment.off('update', onupdate);
			fragment.off('remove', addObject.clear);
			keys(fragment.objects).forEach(addObject.clear);
		});
	}),
	delete: d(function (fragment) {
		var destroy = this.fragments.get(fragment);
		if (destroy) destroy();
		this.fragments.delete(fragment);
	})
}, memoize(function (id) {
	this.objects[id] = objects[id];
	return id;
}, { method: '_addObject', refCounter: true,
	dispose: function (id) {
		delete this.evented[id];
		delete this.objects[id];
		this.emit('remove', id);
	} }))));
