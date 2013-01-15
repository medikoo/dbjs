'use strict';

var startsWith = require('es5-ext/lib/String/prototype/starts-with')
  , Db         = require('../../')

  , keys = Object.keys
  , StringType = Db.String;

module.exports = function () {
	return {
		forEachRelation: function (a) {
			var obj = Db(), data;
			obj.set('feRelTest', StringType.rel('bar'));
			obj.set('feRelTest2', 'foo');
			data = [];
			obj._forEachRelation_(function () { data.push(arguments); });
			a(data.length, 3, "Count");
			data.sort(function (a1, a2) {
				return -a2[0].name.localeCompare(a1[0].name);
			});
			a.deep(data[0], [obj._$construct, obj._$construct._id_, obj], "Item #1");
			a.deep(data[1], [obj._feRelTest, obj._feRelTest._id_, obj], "Item #2");
			a.deep(data[2], [obj._feRelTest2, obj._feRelTest2._id_, obj], "Item #2");
		}
	};
};
