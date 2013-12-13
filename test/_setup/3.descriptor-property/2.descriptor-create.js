'use strict';

var Database = require('../../../')

  , getPrototypeOf = Object.getPrototypeOf;

module.exports = function (a) {
	var db = new Database(), Type = db.Object.extend('TypeObj')
	  , obj = new Type(), protoProtoDesc, protoDesc, desc
	  , prop, protoProtoDescProp, protoDescProp;

	protoProtoDesc = Type.prototype._descriptorPrototype_;
	desc = obj.$get('foo');

	protoProtoDescProp = protoProtoDesc.$get('foo');
	prop = desc.$get('foo');

	a(getPrototypeOf(prop), protoProtoDescProp, "Descriptor out of proto");
	protoDesc = db.Object.prototype.$get('foo');

	a(getPrototypeOf(prop), getPrototypeOf(protoProtoDescProp), "Proto turn #1");
	protoDescProp = protoDesc.$get('foo');
	a(getPrototypeOf(prop), protoDescProp, "Proto turn #2");
	a(desc.$get('foo'), prop, "Return already created");
};
