'use strict';

var Db = require('../../../')

  , StringType = Db.String
  , getId = function (obj) { return obj._id_; };

module.exports = function (t, a) {
	var ns1, ns2, ns3, obj11, obj21, obj31, obj32, iterator, updates, removes;

	ns3 = Db.create('FragTest34', { iteRemtest: StringType });
	ns1 = Db.create('FragTest14', {
		iteTestStr: StringType,
		iteTestMulti: StringType.rel({ multiple: true }),
		otherObj: ns3,
		otherMultipleObj: ns3.rel({ multiple: true })
	});
	ns2 = Db.create('FragTest24', {
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

	// Add obj11
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

	// Add obj31
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

	// Remove obj31
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

	// Add obj21
	iterator.add(obj21);
	a.deep(updates, [obj21, obj21._iteTest].map(getId), "Add other: Updates");
	updates.length = 0;
	a.deep(removes, [], "Add other: Removes");
	removes.length = 0;

	obj11.otherMultipleObj.add(obj31);
	a.deep(updates.sort(), [obj11._otherMultipleObj.getItem(obj31), obj31,
		obj31._iteRemtest].map(getId).sort(), "Add obj item: Updates");
	updates.length = 0;
	a.deep(removes, [], "Add obj item: Removes");
	removes.length = 0;

	obj11.otherMultipleObj.delete(obj31);
	a.deep(updates, [obj11._otherMultipleObj.getItem(obj31)._id_],
		"Add obj item: Updates");
	updates.length = 0;
	a.deep(removes.sort(), [obj31, obj31._iteRemtest].map(getId).sort(),
		"Add obj item: Removes");
	removes.length = 0;

	obj32 = ns3();
	obj11.otherMultipleObj.delete(obj32);
	a.deep(updates, [obj11._otherMultipleObj.getItem(obj32)._id_],
		"Invoke delete item: Updates");
	updates.length = 0;
	a.deep(removes, [], "Invoke delete item: Removes");
	removes.length = 0;
};