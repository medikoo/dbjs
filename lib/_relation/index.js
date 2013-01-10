'use strict';

var d        = require('es5-ext/lib/Object/descriptor')
  , proto    = require('../_proto').prototype
  , simple   = require('./simple')

  , keys = Object.keys
  , isDigit = RegExp.prototype.test.bind(/\d/)
  , relation, rel, item;

relation = module.exports = Object.defineProperties(proto.$$create(''), {
	name: d('', ''),
	_type_: d('', 'relation'),
	_forEachObject_: d(function (cb) {
		proto._forEachObject.call(this, cb);
		keys(this).forEach(function (name) {
			var value;
			if (!isDigit(name[0])) return;
			value = this[name];
			if (!value || (value._type_ !== 'relation-set-item')) return;
			cb(value, value._id_, this);
		}, this);
	}),
	ownerOf: d(function (value) {
		if (!this.hasOwnProperty('_index_')) return null;
		value = this.ns.normalize(value);
		if (value == null) return null;
		return this._index_.getReverse(value);
	})
});

require('./instance');
require('./value');
require('./getter');
require('./indexx');
require('./set');

// Relation Properties

// ns
require('./property/ns');

// required
rel = simple(proto._defineRel_('required'), relation);
rel.$$setValue(false);
rel._required.$$setValue(true);

// multiple
require('./property/multiple');

// writeOnce
rel = simple(proto._defineRel_('writeOnce'), relation);
rel.$$setValue(false);
rel._required.$$setValue(true);

// unique
rel = simple(proto._defineRel_('unique'), relation);
rel.$$setValue(false);
rel._required.$$setValue(true);

// reverse
require('./property/reverse');

// tag
rel = relation._getRel_('tag');
rel._multiple.$$setValue(true);

// triggers
rel = relation._getRel_('triggers');
rel._multiple.$$setValue(true);

// external
rel = simple(proto._defineRel_('external'), relation);
rel.$$setValue(false);
rel._required.$$setValue(true);

// Relation set item properties
item = relation._setItem_;

// order
rel = simple(proto._defineRel_('order'), item);
rel.$$setValue(0);
rel._required.$$setValue(true);

// label
rel = simple(proto._defineRel_('label'), item);

// Special handling for toString
require('./to-string');
