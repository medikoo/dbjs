'use strict';

var Database = require('../../../')
  , Event    = require('../../../_setup/event')

  , getPrototypeOf = Object.getPrototypeOf;

module.exports = function (a) {
	var db = new Database(), Type = db.Object.extend('TypeObj')
	  , obj = new Type(), protoProtoDesc, protoDesc, desc;

	protoProtoDesc = Type.prototype._descriptorPrototype_;
	desc = obj.$getOwn('foo');
	a(getPrototypeOf(desc), protoProtoDesc, "Descriptor out of proto");
	protoDesc = db.Object.prototype.$getOwn('foo');
	a(getPrototypeOf(desc), protoDesc, "Proto turn");
	a(obj.$getOwn('foo'), desc, "Return already created");

	Type = db.Object.extend('OtherTypeObj');
	desc = Type.prototype.getOwnDescriptor('lorem');

	new Event(db.Object.prototype.getOwnDescriptor('lorem'), 'bar'); //jslint: ignore
	a(desc._value_, 'bar');
	a(getPrototypeOf(desc), db.Object.prototype.getOwnDescriptor('lorem'));
};
