'use strict';

var Database = require('../../../')

  , getPrototypeOf = Object.getPrototypeOf;

module.exports = function (a) {
	var db = new Database(), Type = db.Object.extend('TypeObj')
	  , obj = new Type(), protoProtoDesc, protoDesc, desc
	  , prop, protoProtoDescProp, protoDescProp;

	protoProtoDesc = Type.prototype._descriptorPrototype_;
	desc = obj.$getOwn('foo');

	protoProtoDescProp = protoProtoDesc.$getOwn('foo');
	prop = desc.$getOwn('foo');

	a(getPrototypeOf(prop), protoProtoDescProp, "Descriptor out of proto");
	protoDesc = db.Object.prototype.$getOwn('foo');

	a(getPrototypeOf(prop), getPrototypeOf(protoProtoDescProp), "Proto turn #1");
	protoDescProp = protoDesc.$getOwn('foo');
	a(getPrototypeOf(prop), protoDescProp, "Proto turn #2");
	a(desc.$getOwn('foo'), prop, "Return already created");
};
