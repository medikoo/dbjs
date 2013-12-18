'use strict';

var Database = require('../../../')

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
};
