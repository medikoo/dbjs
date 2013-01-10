'use strict';

var Db = require('../../')

  , StringType = Db.String;

module.exports = function (t, a) {
	var ns1, ns2, ns3, obj11, obj12, obj21, obj31, iterator, data, approveData
	  , byId = function (a, b) { return -a._id_.localeCompare(b._id_); }
	  , getId = function (obj) { return obj._id_; };

	ns1 = Db.create('IteratorTest1', {
		iteTestStr: StringType,
		iteTestMulti: StringType.rel({ multiple: true })
	});
	ns2 = Db.create('IteratorTest2', {
		iteTest: ns1.rel({ reverse: 'iteRev1' })
	});
	ns3 = Db.create('IteratorTest3', { iteTest2: ns1 });

	obj11 = ns1({ iteTestStr: 'foo', iteTestMulti: ['raz', 'dwa'] });
	obj12 = ns1({ iteTestStr: 'bar' });
	obj21 = ns2({ iteTest: obj11  });
	obj31 = ns3({ iteTest2: obj11 });
	obj11._getRel_('iteTestOther');
	obj11.iteTestOther = 'whatever';

	data = [];
	approveData = [];

	iterator = new t(function (obj) {
		data.push(obj);
	});
	iterator.approveRelation = function (rel) {
		approveData.push(rel);
		return true;
	};

	iterator.onObject(obj11);

	a.deep(data.sort(byId).map(getId),
		[obj11, obj11._iteTestStr, obj11._iteTestMulti,
			obj11._iteTestMulti.get('raz'), obj11._iteTestMulti.get('dwa'),
			obj21, obj21._iteTest, obj11._iteTestOther].sort(byId).map(getId),
		"Items");

	a.deep(approveData.sort(byId).map(getId),
		[obj11._iteTestStr, obj11._iteTestMulti, ns2.prototype._iteTest,
			obj21._iteTest, obj21._iteTest,
			obj11._iteTestOther].sort(byId).map(getId), "Relations");
};
