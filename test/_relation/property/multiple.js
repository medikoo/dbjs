'use strict';

var Db = require('../../../')

  , StringType = Db.String;

module.exports = function (a) {
	var obj = Db({ multipleTest: StringType }), emitted;

	obj.multipleTest = 'raz';
	a(obj.multipleTest, 'raz', "Init");
	obj._multipleTest.multiple = true;

	a.deep(obj.multipleTest.values, ['raz'], "Converted");
	obj.multipleTest.add('dwa');
	obj.multipleTest.add('trzy');
	a.deep(obj.multipleTest.values.sort(), ['raz', 'dwa', 'trzy'].sort(),
		"Addition");
	obj.multipleTest.delete('trzy');
	a.deep(obj.multipleTest.values.sort(), ['raz', 'dwa'].sort(),
		"Deletion");
	obj._multipleTest.multiple = false;
	a(obj.multipleTest, 'dwa', "Convert back");

	obj._multipleTest.once('change', function (nu, old) { emitted = [nu, old]; });
	obj._multipleTest._multiple._signal_(true);
	a.deep(emitted, [obj._multipleTest, 'dwa'], "Emit change");
};
