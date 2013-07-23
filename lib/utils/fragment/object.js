// Fragment for specific object, tracks its relations, objects referenced in
// relations and objects that refer object in its relation

'use strict';

var d                = require('es5-ext/lib/Object/descriptor')
  , extend           = require('es5-ext/lib/Object/extend')
  , forEach          = require('es5-ext/lib/Object/for-each')
  , callable         = require('es5-ext/lib/Object/valid-callable')
  , ee               = require('event-emitter/lib/core')
  , memoize          = require('memoizee/lib/regular')
  , memoizePrimitive = require('memoizee/lib/primitive')
  , Multi            = require('./multi')
  , Relations        = require('./relations')

  , alwaysPass = function () { return true; }
  , alwaysDeny = function () { return false; }
  , getId = function (obj) { return obj._id_; }
  , getId2 = function (rel, val) { return rel._id_ + '\n' + val._id_; }
  , Observer, passTopRelations, getRelPass, getValPass, resolve;

require('memoizee/lib/ext/dispose');
require('memoizee/lib/ext/method');
require('memoizee/lib/ext/ref-counter');

passTopRelations = function (rel, pass) {
	var parent = rel.obj, tree;
	if (parent._type_ === 'relation-set-item') parent = parent.obj;
	while (parent._type_ === 'relation') {
		if (!tree) tree = [parent];
		else tree.unshift(parent);
		parent = parent.obj;
		if (parent._type_ === 'relation-set-item') parent = parent.obj;
	}
	while (tree && (rel = tree.shift())) {
		if (!pass(rel)) return false;
	}
	return true;
};

getRelPass = memoize(function (fn) {
	return memoizePrimitive(function (rel) { return fn(rel); },
		{ serialize: getId });
});

getValPass = memoize(function (fn) {
	return memoizePrimitive(function (rel, value) { return fn(rel, value); },
		{ serialize: getId2 });
});

resolve = function (value, memoizer, def) {
	if (value == null) return (def || alwaysPass);
	if (value === true) return alwaysPass;
	if (value === false) return alwaysDeny;
	return memoizer(callable(value));
};

Observer = function (root, obj, passRelation, passValue, passAssignment) {
	this.root = root;
	this.path = {};
	this.path[obj._id_] = true;
	this.obj = obj;
	this.passRelation = passRelation;
	this.passValue = passValue;
	this.passAssignment = passAssignment;
	this.valueRels = {};
	this.fragment = new Relations(this.obj, passRelation);
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
		var obj, pass;
		rel = (rel._type_ === 'relation-set-item') ? rel.obj : rel;
		obj = rel.obj;
		if (!obj || (obj._type_ !== 'object')) return;
		if (!passTopRelations(rel, this.passRelation)) return;
		if (!this.passRelation(rel)) return;
		if (this.path[obj._id_]) return;
		if (!(pass = this.passAssignment(rel, this.obj))) return;
		this._extend(obj, resolve(pass.relation, getRelPass, this.passRelation),
			resolve(pass.value, getValPass, this.passValue),
			resolve(pass.assignment, getValPass, this.passAssignment));
	}),
	onDismiss: d(function (rel) {
		var obj, pass;
		rel = (rel._type_ === 'relation-set-item') ? rel.obj : rel;
		obj = rel.obj;
		if (!obj || (obj._type_ !== 'object')) return;
		if (!passTopRelations(rel, this.passRelation)) return;
		if (!this.passRelation(rel)) return;
		if (this.path[obj._id_]) return;
		if (!(pass = this.passAssignment(rel, this.obj))) return;
		this._extend.clearRef(obj,
			resolve(pass.relation, getRelPass, this.passRelation),
			resolve(pass.value, getValPass, this.passValue),
			resolve(pass.assignment, getValPass, this.passAssignment));
	}),
}, memoize(function (obj, passRelation, passValue, passAssignment) {
	var observer = new Observer(this.root, obj, passRelation, passValue,
		passAssignment);
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
		if (obj._type_ === 'relation') this.onRelation(event);
		else if (obj._type_ === 'relation-set-item') this.onSetItem(event, obj);
	}),
	onAssignEvent: d(function (event) { this.onAssign(event.obj); }),
	onDismissEvent: d(function (nu, old) { this.onDismiss((nu || old).obj); }),
	onRelation: d(function (event) {
		var rel = event.obj, relId = rel._id_, value = event.value, pass;

		// Process old
		if (this.valueRels[relId] && (this.valueRels[relId] !== value)) {
			pass = this.passValue(rel, this.valueRels[relId]);
			this._extend.clearRef(this.valueRels[relId],
				resolve(pass.relation, getRelPass, this.passRelation),
				resolve(pass.value, getValPass, this.passValue),
				resolve(pass.assignment, getValPass, this.passAssignment));
			delete this.valueRels[relId];
		}

		// Process new
		if (value && (value._type_ === 'object') &&
				(this.valueRels[relId] !== value)) {
			if (this.path[value._id_]) return;
			if (!(pass = this.passValue(rel, value))) return;
			this._extend(this.valueRels[relId] = value,
				resolve(pass.relation, getRelPass, this.passRelation),
				resolve(pass.value, getValPass, this.passValue),
				resolve(pass.assignment, getValPass, this.passAssignment));
		}
	}),
	onSetItem: d(function (event) {
		var itemId, added, value, pass, rel;
		added = event.value;
		rel = event.obj.obj;
		itemId = event.obj._id_;
		value = event.obj._subject_;
		if (value && (value._type_ === 'object') && !this.path[value._id_]) {
			if (added) {
				if (!this.valueRels[itemId]) {
					if (!(pass = this.passValue(rel, value))) return;
					this._extend(this.valueRels[itemId] = value,
						resolve(pass.relation, getRelPass, this.passRelation),
						resolve(pass.value, getValPass, this.passValue),
						resolve(pass.assignment, getValPass, this.passAssignment));
				}
			} else if (this.valueRels[itemId]) {
				pass = this.passValue(rel, this.valueRels[itemId]);
				this._extend.clearRef(this.valueRels[itemId],
					resolve(pass.relation, getRelPass, this.passRelation),
					resolve(pass.value, getValPass, this.passValue),
					resolve(pass.assignment, getValPass, this.passAssignment));
				delete this.valueRels[itemId];
			}
		}
	})
}))));

module.exports = function (obj/*, pass*/) {
	var root, observer, pass = Object(arguments[1]);

	root = new Multi();
	observer = new Observer(root, obj, resolve(pass.relation, getRelPass),
		resolve(pass.value, getValPass), resolve(pass.assignment, getValPass));

	root.add(observer.fragment);
	observer.init();
	return root;
};
