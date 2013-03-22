'use strict';

var i          = require('es5-ext/lib/Function/i')
  , extend     = require('es5-ext/lib/Object/extend')
  , d          = require('es5-ext/lib/Object/descriptor')
  , forEach    = require('es5-ext/lib/Object/for-each')
  , ee         = require('event-emitter/lib/core')
  , memoize    = require('memoizee/lib/regular')
  , memoizePrm = require('memoizee/lib/primitive')
  , objectFrag = require('./object')

  , keys = Object.keys

  , Fragment;

require('memoizee/lib/ext/dispose');
require('memoizee/lib/ext/method');
require('memoizee/lib/ext/ref-counter');

module.exports = Fragment = function (approveRelation) {
	if (approveRelation != null) this.approveRelation = approveRelation;
	this.evented = {};
	this.disposeCb = {};
	this.fragments = {};
};

ee(Object.defineProperties(Fragment.prototype, extend(memoize(function (obj) {
	var id = obj._id_, fragment, onupdate, onObj;

	onObj = memoizePrm(this.addObj.bind(this), { dispose: this.addObj.clearRef });
	this.fragments[id] = fragment = objectFrag(obj, this.approveRelation);
	fragment.on('update', onupdate = function (nu, old) {
		var id = (nu || old).obj._id_;
		onObj(id);
		if (!nu || !this.evented.hasOwnProperty(id) ||
				(this.evented[id] !== nu.index)) {
			this.evented[id] = nu.index;
			this.emit('update', nu, old);
		}
	}.bind(this));
	fragment.on('remove', onObj.clear);
	forEach(fragment.objects, function (obj, id) {
		var event = obj._lastEvent_;
		if (event) onupdate(event);
	});

	this.disposeCb[id] = function () {
		fragment.off('update', onupdate);
		fragment.off('remove', onObj.clear);
		keys(fragment.objects).forEach(onObj.clear);
		objectFrag.clearRef(obj, this.approveRelation);
	};
	return fragment;
}, { method: 'add', dispose: function (fragment) {
	var id = fragment.obj._id_;
	this.disposeCb[id].call(this);
	delete this.fragments[id];
	delete this.disposeCb[id];
} }), memoizePrm(i, { method: 'addObj', refCounter: true,
	dispose: function (id) {
		delete this.evented[id];
		this.emit('remove', id);
	} }), {
	approveRelation: d(function (rel) { return true; })
}, d.binder({
	remove: d(function (obj) { this.add.clear(obj); })
}))));
