'use strict';

var Db = require('../../')

  , StringType = Db.String

  , getId = function (obj) { return obj._id_; };

module.exports = function (t, a) {
	var ns1, ns2, ns3, obj11, obj21, obj31, iterator, updates, removes;

	ns3 = Db.create('FragTest3', { iteRemtest: StringType });
	ns1 = Db.create('FragTest1', {
		iteTestStr: StringType,
		iteTestMulti: StringType.rel({ multiple: true }),
		otherObj: ns3
	});
	ns2 = Db.create('FragTest2', {
		iteTest: ns1.rel({ reverse: 'iteRev1' })
	});

	obj31 = ns3({ iteRemtest: 'remotes' });
	obj11 = ns1({ iteTestStr: 'foo', iteTestMulti: ['raz', 'dwa'],
		otherObj: obj31 });
	obj21 = ns2({ iteTest: obj11 });

	iterator = new t();
	updates = [];
	iterator.on('update', function (event) { updates.push(event.obj._id_); });
	removes = [];
	iterator.on('remove', function (id) { removes.push(id); });
	iterator.add(obj11);

	a.deep(updates.sort(),
		[obj11, obj11._iteTestStr, obj11._iteTestMulti,
			obj11._iteTestMulti.getItem('raz'),
			obj11._iteTestMulti.getItem('raz')._order,
			obj11._iteTestMulti.getItem('dwa'),
			obj11._iteTestMulti.getItem('dwa')._order,
			obj11._otherObj, obj31, obj31._iteRemtest,
			obj21, obj21._iteTest].map(getId).sort(), "Updates");
	updates.length = 0;
	a.deep(removes, [], "Removes");
	removes.length = 0;

	iterator.add(obj31);
	a.deep(updates, [], "Add existing: Updates");
	updates.length = 0;
	a.deep(removes, [], "Add existing: Removes");
	removes.length = 0;

	obj11.otherObj = null;
	a.deep(updates, [obj11._otherObj._id_], "Clear existing: Updates");
	updates.length = 0;
	a.deep(removes, [], "Clear existing: Removes");
	removes.length = 0;

	iterator.remove(obj31);
	a.deep(updates, [], "Remove existing: Updates");
	updates.length = 0;
	a.deep(removes.sort(), [obj31, obj31._iteRemtest].map(getId).sort(),
		"Remove existing: Removes");
	removes.length = 0;

	obj21.iteTest = null;
	a.deep(updates, [obj21._iteTest._id_], "Remove reverse: Updates");
	updates.length = 0;
	a.deep(removes.sort(), [obj21, obj21._iteTest].map(getId).sort(),
		"Remove reverse: Removes");
	removes.length = 0;

	iterator.add(obj21);
	a.deep(updates, [obj21, obj21._iteTest].map(getId), "Add other: Updates");
	updates.length = 0;
	a.deep(removes, [], "Add other: Removes");
	removes.length = 0;
};
