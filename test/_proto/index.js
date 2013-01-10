'use strict';

var startsWith = require('es5-ext/lib/String/prototype/starts-with')
  , Db         = require('../../')

  , keys = Object.keys
  , StringType = Db.String;

module.exports = function () {
	return {
		lastModified: function (a) {
			var obj = Db();
			a(typeof obj._lastModified_, 'number', "Object");
			a(typeof Db.create('ProtoIndexTest')._lastModified_, 'number',
				"Constructor");
		},
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
		},
		everyRelationDeep: function (a) {
			var obj = Db(), data, subRel, item;
			obj.set('everyRelTest', StringType.rel({ value: ['one', 'two'] }));
			obj.set('everyRelTest2', 'foo');
			obj._everyRelTest2.set('evRelTest', true);
			obj._everyRelTest.get('one').set('evRelTest2', 23);
			data = {};
			obj._everyRelationDeep_(function (item, id) {
				data[id] = item;
				return true;
			});
			a(keys(data).every(function (id) {
				return startsWith.call(id, obj._id_ + ':');
			}), true, "All of object");
			subRel = obj._everyRelTest2._evRelTest;
			a(data[subRel._id_], subRel, "SubRelation");
			item = obj._everyRelTest.get('one')._evRelTest2;
			a(data[item._id_], item, "Item");
		}
	};
};
