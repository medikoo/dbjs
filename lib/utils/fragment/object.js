// Fragment for specific object, tracks its relations, objects referenced in
// relations and objects that refer object in its relation

'use strict';

var d         = require('es5-ext/lib/Object/descriptor')
  , extend    = require('es5-ext/lib/Object/extend')
  , forEach   = require('es5-ext/lib/Object/for-each')
  , ee        = require('event-emitter/lib/core')
  , memoize   = require('memoizee/lib/regular')
  , Multi     = require('./multi')
  , Relations = require('./relations')

  , Observer;

require('memoizee/lib/ext/dispose');
require('memoizee/lib/ext/method');
require('memoizee/lib/ext/ref-counter');

Observer = function (root, obj, approve) {
	this.root = root;
	this.path = {};
	this.path[obj._id_] = true;
	this.obj = obj;
	this.approve = approve;
	this.valueRels = {};
	this.fragment = new Relations(this.obj, this.approve);
};

ee(Object.defineProperties(Observer.prototype, extend({
	init: d(function () {
		// Setup relations
		this.fragment.on('update', this.onUpdate);
		forEach(this.fragment.objects, function (obj) {
			this.onUpdate(obj._lastEvent_);
		}, this);

		// Setup reverse
		this.obj._forEachReverse_(this.onAssign, this);
		this.obj.on('assign', this.onAssignEvent);
		this.obj.on('dismiss', this.onDismissEvent);
	}),
	destroy: d(function () {
		// Destroy child fragments
		this.obj.off('assign', this.onAssignEvent);
		this.obj.off('dismiss', this.onDismissEvent);
		this._extend.clearAll();
		return this.fragment.destroy();
	}),
	onAssign: d(function (rel) {
		var obj;
		rel = (rel._type_ === 'relation-set-item') ? rel.obj : rel;
		obj = rel.obj;
		if (!obj || (obj._type_ !== 'object')) return;
		if (!this.approve(rel)) return;
		if (this.path[obj._id_]) return;
		this._extend(obj);
	}),
	onDismiss: d(function (rel) {
		var obj;
		rel = (rel._type_ === 'relation-set-item') ? rel.obj : rel;
		obj = rel.obj;
		if (!obj || (obj._type_ !== 'object')) return;
		if (!this.approve(rel)) return;
		if (this.path[obj._id_]) return;
		this._extend.clearRef(obj);
	}),
}, memoize(function (obj) {
	var observer = new Observer(this.root, obj, this.approve);
	extend(observer.path, this.path);
	this.root.add(observer.fragment);
	observer.init();
	return observer;
}, { method: '_extend', refCounter: true, dispose: function (observer) {
	this.root.delete(observer.fragment);
	observer.destroy();
} }), d.binder({
	onUpdate: d(function (event) {
		var obj = event.obj;
		if (obj._type_ === 'relation') this.onRelation(event, obj);
		else if (obj._type_ === 'relation-set-item') this.onSetItem(event, obj);
	}),
	onAssignEvent: d(function (event) { this.onAssign(event.obj); }),
	onDismissEvent: d(function (nu, old) { this.onDismiss((nu || old).obj); }),
	onRelation: d(function (event, rel) {
		var relId = rel._id_, value = event.value;

		// Process old
		if (this.valueRels[relId] && (this.valueRels[relId] !== value)) {
			this._extend.clearRef(this.valueRels[relId]);
			delete this.valueRels[relId];
		}

		// Process new
		if (value && (value._type_ === 'object') &&
				(this.valueRels[relId] !== value)) {
			// TODO: Check for outer gate through scan of relation proto chain

			if (!this.path[value._id_]) this._extend(this.valueRels[relId] = value);
		}
	}),
	onSetItem: d(function (event, item) {
		var added, value;
		added = event.value;
		value = item._subject_;
		if (value && (value._type_ === 'object') && !this.path[value._id_]) {
			if (added) {
				if (!this.valueRels[item._id_]) {
					this._extend(this.valueRels[item._id_] = value);
				}
			} else if (this.valueRels[item._id_]) {
				this._extend.clearRef(value);
				delete this.valueRels[item._id_];
			}
		}
	})
}))));

module.exports = function (obj, approve) {
	var root = new Multi(), observer = new Observer(root, obj, approve);
	root.add(observer.fragment);
	observer.init();
	return root;
};
