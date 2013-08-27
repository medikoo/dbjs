'use strict';

var isError = require('es5-ext/error/is-error')
  , Db      = require('../../')

  , StringType = Db.String;

module.exports = function () {
	return {
		getPropertyNames: function (a) {
			var other, obj = new Db()
			  , standard = [].sort();
			a.deep(obj.getPropertyNames().values.sort(), standard, "Empty");
			obj.set('protoPropertiesTest1');
			a.deep(obj.getPropertyNames().values.sort(), standard, "One defined");
			obj._protoPropertiesTest1.required = true;
			a.deep(obj.getPropertyNames().values.sort(),
				standard.concat('protoPropertiesTest1').sort(), "One required");
			obj.set('protoPropertiesTest2', false);
			a.deep(obj.getPropertyNames().values.sort(),
				standard.concat('protoPropertiesTest1', 'protoPropertiesTest2').sort(),
				"Set value");
			other = obj.$$create('protoPropertiesTestExt');
			a.deep(other.getPropertyNames().values.sort(),
				standard.concat('protoPropertiesTest1', 'protoPropertiesTest2').sort(),
				"Extension");
			other.set('protoPropTest3', 0);
			a.deep(other.getPropertyNames().values.sort(),
				standard.concat('protoPropertiesTest1', 'protoPropertiesTest2',
					'protoPropTest3').sort(), "Extension: Set");

			other._protoPropertiesTest2.tags = other._protoPropTest3.tags =
				'getnamestest';
			a.deep(other.getPropertyNames('getnamestest').values.sort(),
				['protoPropertiesTest2', 'protoPropTest3'].sort(), "Tagged names");
		},
		setProperties: function (a) {
			var obj = new Db();
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
			var obj = new Db(), other;
			obj.set('protoPropsSetValNew1', StringType.required);
			other = obj.$$create('protoPropsSetValNewTest');
			a(isError(other.validateCreateProperties({ protoPropsSetValNew1: null })),
				true, "Error");
			a(other.validateCreateProperties({ protoPropsSetValNew1: 'raz' }), null,
				"Error");
		},
		validateCreateUndefined: function (a) {
			var obj = new Db(), other;
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
