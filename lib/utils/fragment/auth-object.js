// Fragment for authenticated user
// (may provide access to many objects)

'use strict';

var i          = require('es5-ext/lib/Function/i')
  , d          = require('es5-ext/lib/Object/descriptor')
  , extend     = require('es5-ext/lib/Object/extend')
  , ee         = require('event-emitter/lib/core')
  , memoize    = require('memoizee/lib/regular')
  , memoizePrm = require('memoizee/lib/primitive')
  , ObjectFrag = require('./object')

  , keys = Object.keys

  , Fragment;

require('memoizee/lib/ext/dispose');
require('memoizee/lib/ext/method');
require('memoizee/lib/ext/ref-counter');

module.exports = Fragment = function (obj, approve) {
	this.obj = obj;
	this.approve = approve;
	this.evented = {};
	this.disposeCb = {};
	this.fragments = {};
	this.objects = {};
	this.add(obj);
};

ee(Object.defineProperties(Fragment.prototype, extend(memoize(function (obj) {
	var id = obj._id_, fragment, onupdate, onObj;

	onObj = memoizePrm(this.addObj.bind(this), { dispose: this.addObj.clearRef });
	this.fragments[id] = fragment = new ObjectFrag(obj, this.approveRelation);
	fragment.on('update', onupdate = function (nu, old) {
		var obj = (nu || old).obj, id = obj._id_;
		onObj(id);
		if (!nu || !this.evented.hasOwnProperty(id) ||
				(this.evented[id] !== nu.index)) {
			if (nu) this.evented[id] = nu.index;
			this.objects[id] = obj;
			this.emit('update', nu, old);
		}
	}.bind(this));
	fragment.on('remove', onObj.clear);

	this.disposeCb[id] = function () {
		fragment.off('update', onupdate);
		fragment.off('remove', onObj.clear);
		keys(fragment.destroy()).forEach(onObj.clear);
	};

	fragment.init();
	return fragment;
}, { method: 'add', dispose: function (fragment) {
	var id = fragment.obj._id_;
	this.disposeCb[id].call(this);
	delete this.fragments[id];
	delete this.disposeCb[id];
} }), memoizePrm(i, { method: 'addObj', refCounter: true,
	dispose: function (id) {
		delete this.evented[id];
		delete this.objects[id];
		this.emit('remove', id);
	} }), {
	approveRelation: d(function (rel) { return true; })
}, d.binder({
	remove: d(function (obj) { this.add.clear(obj); }),
	approveRelation: d(function (rel) { return this.approve(rel, this.obj); })
}))));

module.exports = memoize(function (obj, approve) {
	return new Fragment(obj, approve);
}, { refCounter: true, dispose: function (fragment) {
	fragment.remove(fragment.obj);
} });
