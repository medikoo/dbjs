'use strict';

var isError  = require('es5-ext/lib/Error/is-error')
  , Db       = require('../../')

  , Base = Db.Base, StringType = Db.String;

module.exports = function () {
	var obj = Base.create('ProtoPropertyTest');
	return {
		set: function (a) {
			var ns2, ns, ns1;

			obj.set('protoPropertyTestSet', 'bar');
			a(obj.protoPropertyTestSet, 'bar');
			a.throws(function () {
				obj.set('_foo', 'whatever');
			}, "Bad property name");
		},
		$set: function (a) {
			obj.set('protoPropertyTestSSet', StringType.rel({ required: true }));
			a(obj._protoPropertyTestSSet.ns, StringType, "Transport: Namespace");
			a(obj._protoPropertyTestSSet.required, true, "Transport: SubProperty");

			obj.set('ProtoPropertyTestSSet2', StringType);
			a(obj.ProtoPropertyTestSSet2, StringType, "Namespace");

			obj.set('protoPropertyTestSSet3', StringType);
			a(obj.protoPropertyTestSSet3, undefined, "Value: Value");
			a(obj._protoPropertyTestSSet3.ns, StringType, "Value: Namespace");

			obj.set('protoPropertyTestSSet4', 'bar');
			a(obj.protoPropertyTestSSet4, 'bar', "Value");
		},
		validateProperty: function (a) {
			a(isError(obj.validateProperty('_sdf', true)), true, "Name");
			a(isError(obj.validateProperty('foo',
				Base.rel({ multiple: false, value: ['raz'] }))), true, "Transport");
			a(isError(obj.validateProperty('foo', {})), true, "Value");
		},
		validateCreateProperty: function (a) {
			obj.set('protoPropertyTestValidateNew', Base.rel({ required: true }));
			a(isError(obj.validateCreateProperty('protoPropertyTestValidateNew')),
				true, "Unset");
			obj.protoPropertyTestValidateNew = true;
			a(obj.validateCreateProperty('protoPropertyTestValidateNew'), null,
				"Set");
		}
	};
};
