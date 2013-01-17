'use strict';

var arrRemove = require('es5-ext/lib/Array/prototype/remove')
  , d         = require('es5-ext/lib/Object/descriptor')
  , relation  = require('./')

  , defineProperty = Object.defineProperty

  , activateTriggers, deactivateTriggers;

activateTriggers = function (baseRel) {
	var ontriggeradd, ontriggerdelete, onadd, onremove, onnsadd, onnsremove
	  , add, remove, name, obj, objects, subGetter;
	obj = baseRel.obj;
	name = '_' + baseRel.name;
	onadd = function (event) { add(event.obj); };
	onremove = function (event) { remove(event.obj); };
	onnsadd = function (event) { add(event.obj.prototype); };
	onnsremove = function (event) { remove(event.obj.prototype); };
	add = function (obj) {
		var rel;
		rel = obj[name];
		if (rel.hasOwnProperty('_value')) return;
		defineProperty(rel, '_getter_', d(subGetter));
		objects.push(obj);
		obj.on('add', onadd);
		obj.on('remove', onremove);
		if (obj._type_ === 'prototype') {
			obj.ns.on('add', onnsadd);
			obj.ns.on('remove', onnsremove);
		}
		baseRel.triggers.forEach(function (triggerName) {
			obj.get(triggerName).on('change', rel._update_);
		});
		rel._update_();
		if (obj.hasOwnProperty('_children_')) obj._children_.forEach(onadd);
	};
	remove = function (obj) {
		var rel;
		rel = obj[name];
		if (!rel.hasOwnProperty('_getter_')) return;
		delete rel._getter_;
		arrRemove.call(objects, obj);
		obj.off('add', onadd);
		obj.off('remove', onremove);
		if (obj._type_ === 'prototype') {
			obj.ns.off('add', onnsadd);
			obj.ns.off('remove', onnsremove);
		}
		baseRel.triggers.forEach(function (triggerName) {
			obj['_' + triggerName].off('change', rel._update_);
		});
		if (obj.hasOwnProperty('_children_')) obj._children_.forEach(onremove);
	};

	// Whenever new trigger is added, set it up and refresh values
	baseRel.triggers.on('add', ontriggeradd = function (triggerName) {
		objects.forEach(function self(obj) {
			var rel = obj[name];
			obj.get(triggerName).on('change', rel._update_);
			rel._update_();
		});
	});

	// Whenever trigger is removed, deactivate it
	baseRel.triggers.on('delete', ontriggerdelete = function (triggerName) {
		triggerName = '_' + triggerName;
		objects.forEach(function self(obj) {
			obj[triggerName].off('change', obj[name]._update_);
		});
	});

	objects = [obj];

	// Main relation getter configuaration
	defineProperty(baseRel, '_getter_',
		d({ ontriggeradd: ontriggeradd, ontriggerdelete: ontriggerdelete,
			add: add, remove: remove, objects: objects }));
	obj.on('add', onadd);
	obj.on('remove', onremove);
	if (obj._type_ === 'prototype') {
		obj.ns.on('add', onnsadd);
		obj.ns.on('remove', onnsremove);
	}

	// Extended relations getter configuration
	subGetter = { add: add, remove: remove };
	baseRel.triggers.forEach(function (triggerName) {
		// Make sure property is globally defined
		obj.get(triggerName).on('change', baseRel._update_);
	});

	baseRel._update_();

	// Activate triggers for relation extensions
	if (obj.hasOwnProperty('_children_')) obj._children_.forEach(onadd);
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
				} else if (this._getter_.once) {
					this._update_();
					return;
				}
				// Upper relation getter
				// Deactivate it
				deactivateTriggers(this);
			}

			if (this.triggers.count) {
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
