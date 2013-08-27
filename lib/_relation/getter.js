'use strict';

var arrRemove   = require('es5-ext/array/#/remove')
  , d           = require('es5-ext/object/descriptor')
  , relation    = require('./')

  , defineProperty = Object.defineProperty

  , activateTriggers, deactivateTriggers;

activateTriggers = function (baseRel) {
	var ontriggeradd, ontriggerdelete, onadd, onremove, onnsadd, onnsremove
	  , add, remove, name, obj, objects, subGetter;
	obj = baseRel.obj;
	name = '_' + baseRel.name;
	onadd = function (event) { add(event.obj); };
	onremove = function (nu, old) { remove((nu || old).obj); };
	onnsadd = function (event) { add(event.obj.prototype); };
	onnsremove = function (nu, old) { remove((nu || old).obj.prototype); };
	add = function (obj) {
		var rel;
		rel = obj[name];
		if (rel.hasOwnProperty('_value')) return;
		defineProperty(rel, '_getter_', d(subGetter));
		objects.push(obj);
		obj.on('extend', onadd);
		obj.on('reduce', onremove);
		if (obj._type_ === 'prototype') {
			obj.ns.on('extend', onnsadd);
			obj.ns.on('reduce', onnsremove);
		}
		baseRel.triggers.forEach(function (triggerName) {
			var trigger = obj.get(triggerName);
			trigger.on('change', rel._update_);
			trigger.on('add', rel._update_);
			trigger.on('delete', rel._update_);
		});
		rel._update_();
		if (obj.hasOwnProperty('_children_')) obj._children_.forEach(add);
	};
	remove = function (obj) {
		var rel;
		rel = obj[name];
		if (!rel.hasOwnProperty('_getter_')) return;
		delete rel._getter_;
		arrRemove.call(objects, obj);
		obj.off('extend', onadd);
		obj.off('reduce', onremove);
		if (obj._type_ === 'prototype') {
			obj.ns.off('extend', onnsadd);
			obj.ns.off('reduce', onnsremove);
		}
		baseRel.triggers.forEach(function (triggerName) {
			var trigger = obj['_' + triggerName];
			trigger.off('change', rel._update_);
			trigger.off('add', rel._update_);
			trigger.off('delete', rel._update_);
		});
		if (obj.hasOwnProperty('_children_')) obj._children_.forEach(remove);
	};

	// Whenever new trigger is added, set it up and refresh values
	baseRel.triggers.on('add', ontriggeradd = function (triggerName) {
		objects.forEach(function self(obj) {
			var rel = obj[name], trigger = obj.get(triggerName);
			trigger.on('change', rel._update_);
			trigger.on('add', rel._update_);
			trigger.on('delete', rel._update_);
			rel._update_();
		});
	});

	// Whenever trigger is removed, deactivate it
	baseRel.triggers.on('delete', ontriggerdelete = function (triggerName) {
		triggerName = '_' + triggerName;
		objects.forEach(function self(obj) {
			var trigger = obj[triggerName], cb = obj[name]._update_;
			trigger.off('change', cb);
			trigger.off('add', cb);
			trigger.off('delete', cb);
		});
	});

	objects = [obj];

	// Main relation getter configuaration
	defineProperty(baseRel, '_getter_',
		d({ ontriggeradd: ontriggeradd, ontriggerdelete: ontriggerdelete,
			add: add, remove: remove, objects: objects }));
	obj.on('extend', onadd);
	obj.on('reduce', onremove);
	if (obj._type_ === 'prototype') {
		obj.ns.on('extend', onnsadd);
		obj.ns.on('reduce', onnsremove);
	}

	// Extended relations getter configuration
	subGetter = { add: add, remove: remove };
	baseRel.triggers.forEach(function (triggerName) {
		var trigger = obj.get(triggerName);
		trigger.on('change', baseRel._update_);
		trigger.on('add', baseRel._update_);
		trigger.on('delete', baseRel._update_);
	});

	baseRel._update_();

	// Activate triggers for relation extensions
	if (obj.hasOwnProperty('_children_')) obj._children_.forEach(add);
};

deactivateTriggers = function (rel) {
	var getter = rel._getter_, obj = rel.obj;
	if (getter.once) {
		rel.triggers.off('add', getter.once);
		delete rel._getter_;
		return;
	}
	if (getter.ontriggeradd) rel.triggers.off('add', getter.ontriggeradd);
	if (getter.ontriggerdelete) {
		rel.triggers.off('delete', getter.ontriggerdelete);
	}
	getter.remove(obj);
};

Object.defineProperties(relation, {
	_setGetter_: d(function () {
		var name, getter;
		if (this.hasOwnProperty('_value')) {
			if (this.hasOwnProperty('_getter_')) {
				// Some getter is already setup
				if (this._getter_.objects) {
					// Function has changed, refresh values
					name = '_' + this.name;
					this._getter_.objects.forEach(function (child) {
						child[name]._update_();
					});
					return;
				}
				if (this._getter_.once) {
					this._update_();
					return;
				}
				// Upper relation getter
				// Deactivate it
				deactivateTriggers(this);
			}

			if (this.triggers.count || this._value._hasDynamicTriggers_) {
				// Setup getter
				activateTriggers(this);
			} else {
				// No triggers, do not setup getter
				// but we wait until first trigger is added
				defineProperty(this, '_getter_', d(getter = {}));
				this.triggers.once('add', getter.once = function () {
					delete this._getter_;
					activateTriggers(this);
				}.bind(this));
				this._update_();
			}
		} else {
			if (this.hasOwnProperty('_getter_')) {
				// Deactivate old base getter
				deactivateTriggers(this);
			}
			if (this._getter_.add) {
				this._getter_.add(this.obj);
			} else {
				this._update_();
			}
		}
	}),
	_deleteGetter_: d(function () {
		if (this.hasOwnProperty('_getter_')) deactivateTriggers(this);
	})
});
