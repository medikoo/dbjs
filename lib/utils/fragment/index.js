// Fragment for a client instance
// (may provide access to many authenticated users)

'use strict';

var i          = require('es5-ext/lib/Function/i')
  , extend     = require('es5-ext/lib/Object/extend')
  , d          = require('es5-ext/lib/Object/descriptor')
  , forEach    = require('es5-ext/lib/Object/for-each')
  , ee         = require('event-emitter/lib/core')
  , memoize    = require('memoizee/lib/regular')
  , memoizePrm = require('memoizee/lib/primitive')
  , objectFrag = require('./auth-object')

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

	// Initialize function that's safe for addObj counter
	// (so same object won't be added more than once)
	onObj = memoizePrm(this.addObj.bind(this), { dispose: this.addObj.clearRef });

	// Create fragment for given object
	this.fragments[id] = fragment = objectFrag(obj, this.approveRelation);
	fragment.on('update', onupdate = function (nu, old) {
		var id = (nu || old).obj._id_;
		onObj(id);
		if (!nu || !this.evented.hasOwnProperty(id) ||
				(this.evented[id] !== nu.index)) {
			// Emit only if object was removed, or event was not emitted yet
			if (nu) this.evented[id] = nu.index;
			this.emit('update', nu, old);
		}
	}.bind(this));
	fragment.on('remove', onObj.clear);
	forEach(fragment.objects, function (obj, id) { onupdate(obj._lastEvent_); });

	// Save dispose logic for this object
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
} }),

	// Fragment wide object counter.
	// Objects may overlap between authenticated users, with reference counter we
	// track whether object should be removed from fragment totally or kept
	// as it's needed for other user.
	memoizePrm(i, { method: 'addObj', refCounter: true,
		dispose: function (id) {
			delete this.evented[id];
			this.emit('remove', id);
		} }), {
		approveRelation: d(function (rel) { return true; })
	}, d.binder({
		remove: d(function (obj) { this.add.clear(obj); })
	}))));
