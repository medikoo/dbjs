// Fragment for specific object with it's relatives for authenticated user

'use strict';

var d         = require('es5-ext/lib/Object/descriptor')
  , extend    = require('es5-ext/lib/Object/extend')
  , forEach   = require('es5-ext/lib/Object/for-each')
  , ee        = require('event-emitter/lib/core')
  , memoize   = require('memoizee/lib/regular')
  , Relations = require('./relations')

  , create = Object.create, keys = Object.keys
  , isDigit = RegExp.prototype.test.bind(/\d/)

  , Fragment;

require('memoizee/lib/ext/dispose');
require('memoizee/lib/ext/method');
require('memoizee/lib/ext/ref-counter');

Fragment = function (memory, obj, approve, parent) {
	this.memory = memory;
	memory[obj._id_] = true;
	this.obj = obj;
	this.approve = approve;
	this.valueRels = {};
	this.objects = {};
	this.relFragment = new Relations(obj, this.approve);
	this.objFragments = {};
	this.emitter = parent || this;
};

ee(Object.defineProperties(Fragment.prototype, extend({
	init: d(function () {
		var event;

		// Emit self
		this.objects[this.obj._id_] = this.obj;
		event = this.obj._lastEvent_;
		if (event) this.emitter.emit('update', event);
		this.obj.on('selfupdate', this.onSelfUpdate);

		// Setup relations
		this.relFragment.on('relupdate', this.onRelation);
		this.relFragment.on('setitemupdate', this.onSetItem);
		this.relFragment.init();

		// Setup reverse
		this.obj._forEachReverse_(this.onAssign, this);
		this.obj.on('assign', this.onAssignEvent);
		this.obj.on('dismiss', this.onDismissEvent);
	}),
	destroy: d(function () {
		// Destroy child fragments
		var removed = {};
		forEach(this.objFragments, function (frg) {
			extend(removed, frg.destroy());
		});

		// Destroy self
		this.obj.off('selfupdate', this.onSelfUpdate);
		this.relFragment.off('relupdate', this.onRelation);
		this.relFragment.off('setitemupdate', this.onSetItem);
		this.relFragment.destroy();

		this.obj.off('assign', this.onAssignEvent);
		this.obj.off('dismiss', this.onDismissEvent);
		extend(removed, this.objects);
		this.objects = {};
		return removed;
	}),
	onAssign: d(function (rel) {
		var obj = rel.obj;
		if (!obj || (obj._type_ !== 'object') || !isDigit(obj._id_)) return;
		if (!this.approve(rel)) return;
		if (this.memory[obj._id_]) return;
		this._add(obj);
	}),
	onDismiss: d(function (rel) {
		var obj = rel.obj;
		if (!obj || (obj._type_ !== 'object') || !isDigit(obj._id_)) return;
		if (!this.approve(rel)) return;
		if (this.memory[obj._id_]) return;
		this._add.clearRef(obj);
	}),
}, memoize(function (obj) {
	(this.objFragments[obj._id_] =
		new Fragment(create(this.memory), obj, this.approve, this.emitter)).init();
	return obj;
}, { method: '_add', refCounter: true, dispose: function (obj) {
	var fragment;
	fragment = this.objFragments[obj._id_];
	delete this.objFragments[obj._id_];
	keys(fragment.destroy()).forEach(function (id) {
		this.emitter.emit('remove', id);
	}, this);
} }), d.binder({
	onSelfUpdate: d(function (nu, old) { this.emitter.emit('update', nu, old); }),
	onAssignEvent: d(function (event) { this.onAssign(event.obj); }),
	onDismissEvent: d(function (nu, old) { this.onDismiss((nu || old).obj); }),
	onRelation: d(function (nu, old, fragment) {
		var rel = (nu || old).obj, relId = rel._id_, value = nu && nu.value;

		// Process old
		if (this.valueRels[relId] && (this.valueRels[relId] !== value)) {
			this._add.clearRef(this.valueRels[relId]);
			delete this.valueRels[relId];
		}

		// Process new
		if (value && (value._type_ === 'object') && isDigit(value._id_) &&
				(this.valueRels[relId] !== value) && (value !== fragment.obj) &&
				!this.memory[value._id_]) {
			this._add(this.valueRels[relId] = value);
		}

		// Emit
		this.objects[relId] = rel;
		this.emitter.emit('update', nu, old);
	}),
	onSetItem: d(function (nu, old, fragment) {
		var added, value, doProcess, item;
		added = nu && nu.value;
		item = (nu || old).obj;
		value = item._subject_;
		if (value && (value._type_ === 'object') && isDigit(value._id_)) {
			if (nu && old) doProcess = (nu.value !== old.value);
			else doProcess = (old || added);
			if (doProcess && !this.memory[value._id_]) {
				if (added) this._add(value);
				else this._add.clearRef(value);
			}
		}
		this.objects[item._id_] = item;
		this.emitter.emit('update', nu, old);
	})
}))));

module.exports = function (obj, approve) {
	return new Fragment({}, obj, approve);
};
