'use strict';

var d         = require('es5-ext/lib/Object/descriptor')
  , extend    = require('es5-ext/lib/Object/extend')
  , forEach   = require('es5-ext/lib/Object/for-each')
  , ee        = require('event-emitter/lib/core')
  , memoize   = require('memoizee/lib/regular')
  , Relations = require('./relations')

  , isDigit = RegExp.prototype.test.bind(/\d/)

  , Fragment;

require('memoizee/lib/ext/dispose');
require('memoizee/lib/ext/method');
require('memoizee/lib/ext/ref-counter');

Fragment = function (obj, approve) {
	this.obj = obj;
	this.approve = approve;
	this.valueRels = {};
	this.objects = {};
	this.add(this.obj);
};

ee(Object.defineProperties(Fragment.prototype, extend(memoize(function (obj) {
	return new Relations(obj, this.approveRelation);
}, { method: '_add', refCounter: true, dispose: function (fragment) {
	var obj = fragment.obj, id = obj._id_, objs;
	obj.off('selfupdate', this.onSelfUpdate);
	fragment.off('relupdate', this.onRelation);
	fragment.off('setitemupdate', this.onSetItem);
	objs = fragment.objects;
	fragment.destroy();
	forEach(objs, function (obj) {
		var id = obj._id_;
		delete this.objects[id];
		this.emit('remove', id);
	}, this);

	obj.off('assign', this.onAssignEvent);
	obj.off('dismiss', this.onDismissEvent);
	obj._forEachReverse_(this.onDismiss, this);
	delete this.objects[id];
	this.emit('remove', id);
} }), {
	onAssign: d(function (rel) {
		var obj = rel.obj;
		if (!obj || (obj._type_ !== 'object') || !isDigit(obj._id_) ||
				!this.approveRelation(rel)) {
			return;
		}
		if (obj === this.obj) return;
		this.add(obj);
	}),
	onDismiss: d(function (rel) {
		var obj = rel.obj;
		if (!obj || (obj._type_ !== 'object') || !isDigit(obj._id_) ||
				!this.approveRelation(rel)) {
			return;
		}
		if (obj === this.obj) return;
		this.remove(obj);
	}),
}, d.binder({
	add: d(function (obj) {
		var fragment, event;
		fragment = this._add(obj);
		if (this.objects.hasOwnProperty(obj._id_)) return fragment;
		this.objects[obj._id_] = obj;
		event = obj._lastEvent_;
		if (event) this.emit('update', event);
		obj.on('selfupdate', this.onSelfUpdate);
		fragment.on('relupdate', this.onRelation);
		fragment.on('setitemupdate', this.onSetItem);
		fragment.init();

		// Setup reverse
		obj._forEachReverse_(this.onAssign, this);
		obj.on('assign', this.onAssignEvent);
		obj.on('dismiss', this.onDismissEvent);

		return fragment;
	}),
	remove: d(function (obj) { this._add.clearRef(obj); }),
	approveRelation: d(function (rel) { return this.approve(rel, this.obj); }),
	onSelfUpdate: d(function (nu, old) { this.emit('update', nu, old); }),
	onAssignEvent: d(function (event) { this.onAssign(event.obj); }),
	onDismissEvent: d(function (nu, old) { this.onDismiss((nu || old).obj); }),
	onRelation: d(function (nu, old, fragment) {
		var rel = (nu || old).obj, relId = rel._id_, value = nu && nu.value;

		// Process old
		if (this.valueRels[relId] && (this.valueRels[relId] !== value)) {
			this.remove(this.valueRels[relId]);
			delete this.valueRels[relId];
		}

		// Process new
		if (value && (value._type_ === 'object') && isDigit(value._id_) &&
				(this.valueRels[relId] !== value) && (value !== fragment.obj) &&
				(value !== this.obj)) {
			this.add(this.valueRels[relId] = value);
		}

		// Emit
		this.objects[relId] = rel;
		this.emit('update', nu, old);
	}),
	onSetItem: d(function (nu, old, fragment) {
		var added, value, doProcess, item;
		added = nu && nu.value;
		item = (nu || old).obj;
		value = item._subject_;
		if (value && (value._type_ === 'object') && isDigit(value._id_)) {
			if (nu && old) doProcess = (nu.value !== old.value);
			else doProcess = (old || added);
			if (doProcess) {
				if (added) this.add(value);
				else this.remove(value);
			}
		}
		this.objects[item._id_] = item;
		this.emit('update', nu, old);
	})
}))));

module.exports = memoize(function (obj, approve) {
	return new Fragment(obj, approve);
}, { refCounter: true, dispose: function (fragment) {
	fragment.remove(fragment.obj);
} });
