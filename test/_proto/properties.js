'use strict';

var isError  = require('es5-ext/lib/Error/is-error')
  , Db       = require('../../')

  , keys = Object.keys
  , Base = Db.Base, StringType = Db.String;

module.exports = function () {
	return {
		getPropertyNames: function (a) {
			var other, obj = Db()
			  , standard = ['$construct', 'validateConstruction', 'toString'].sort();
			a.deep(obj.getPropertyNames().sort(), standard, "Empty");
			obj.set('protoPropertiesTest1');
			a.deep(obj.getPropertyNames().sort(), standard, "One defined");
			obj._protoPropertiesTest1.required = true;
			a.deep(obj.getPropertyNames().sort(),
				standard.concat('protoPropertiesTest1').sort(), "One required");
			obj.set('protoPropertiesTest2', false);
			a.deep(obj.getPropertyNames().sort(),
				standard.concat('protoPropertiesTest1', 'protoPropertiesTest2').sort(),
				"Set value");
			other = obj.$$create('protoPropertiesTestExt');
			a.deep(other.getPropertyNames().sort(),
				standard.concat('protoPropertiesTest1', 'protoPropertiesTest2').sort(),
				"Extension");
			other.set('protoPropTest3', 0);
			a.deep(other.getPropertyNames().sort(),
				standard.concat('protoPropertiesTest1', 'protoPropertiesTest2',
					'protoPropTest3').sort(), "Extension: Set");
		},
		setProperties: function (a) {
			var obj = Db();
			obj.setProperties({
				protoPropsSet1: true,
				protoPropsSet2: 23
			});
			a.deep([obj.protoPropsSet1, obj.protoPropsSet2], [true, 23]);
			a.throws(function () {
				obj.setProperties({ _protoPropsSet1: true });
			}, "Error");
		},
		validateCreateProperties: function (a) {
			var obj = Db(), other
			obj.set('protoPropsSetValNew1', StringType.required);
			other = obj.$$create('protoPropsSetValNewTest');
			a(isError(other.validateCreateProperties({ protoPropsSetValNew1: null })),
				true, "Error");
			a(other.validateCreateProperties({ protoPropsSetValNew1: 'raz' }), null,
				"Error");
		},
		validateCreateUndefined: function (a) {
			var obj = Db(), other
			obj.set('protoPropsSetValNew1', StringType.required);
			other = obj.$$create('protoPropsSetValNewTest');
			a(isError(other.validateCreateUndefined()),
				true, "Error: no props");
			a(isError(other.validateCreateUndefined({})),
				true, "Error");
			a(other.validateCreateUndefined({ protoPropsSetValNew1: 'raz' }), null,
				"Error");
		}
	};
};
