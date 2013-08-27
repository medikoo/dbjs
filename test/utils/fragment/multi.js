'use strict';

var values     = require('es5-ext/object/values')
  , Db         = require('../../../')
  , objectFrag = require('../../../lib/utils/fragment/object')

  , StringType = Db.String
  , getId = function (obj) { return obj._id_; };

module.exports = {
	"Auth object Legacy": function (T, a) {
		var ns1, ns2, ns3, ns4, obj11, obj21, obj31, obj32, obj33, obj41, plainObj
		  , iterator, updates, removes, frag, frag2;

		ns3 = Db.create('AFragTest3', { iteRemtest: StringType });
		ns1 = Db.create('AFragTest1', {
			iteTestStr: StringType,
			iteTestMulti: StringType.rel({ multiple: true }),
			otherObj: ns3,
			otherMultipleObj: ns3.rel({ multiple: true })
		});
		ns2 = Db.create('AFragTest2', {
			iteTest: ns1.rel({ reverse: 'iteRev1' })
		});

		obj31 = ns3({ iteRemtest: 'remotes' });
		obj11 = ns1({ iteTestStr: 'foo', iteTestMulti: ['raz', 'dwa'],
			otherObj: obj31 });
		obj21 = ns2({ iteTest: obj11 });

		frag = objectFrag(obj11);
		iterator = new T();
		iterator.add(frag);
		updates = [];
		iterator.on('update', function (event) { updates.push(event.obj._id_); });
		removes = [];
		iterator.on('remove', function (id) { removes.push(id); });

		a.deep(values(iterator.objects).map(getId).sort(),
			[obj11, obj11._iteTestStr, obj11._iteTestMulti,
				obj11._iteTestMulti.getItem('raz'),
				obj11._iteTestMulti.getItem('raz')._order,
				obj11._iteTestMulti.getItem('dwa'),
				obj11._iteTestMulti.getItem('dwa')._order,
				obj11._otherObj, obj31, obj31._iteRemtest,
				obj21, obj21._iteTest].map(getId).sort(), "Initial");

		obj11.otherObj = null;
		a.deep(updates, [obj11._otherObj._id_], "Clear existing: Updates");
		updates.length = 0;
		a.deep(removes.sort(), [obj31, obj31._iteRemtest].map(getId).sort(),
			"Clear existing: Removes");
		removes.length = 0;
		a.deep(values(iterator.objects).map(getId).sort(),
			[obj11, obj11._iteTestStr, obj11._iteTestMulti,
				obj11._iteTestMulti.getItem('raz'),
				obj11._iteTestMulti.getItem('raz')._order,
				obj11._iteTestMulti.getItem('dwa'),
				obj11._iteTestMulti.getItem('dwa')._order,
				obj11._otherObj,
				obj21, obj21._iteTest].map(getId).sort(), "Clear existing: Total");

		obj21.iteTest = null;
		a.deep(updates, [obj21._iteTest._id_], "Remove reverse: Updates");
		updates.length = 0;
		a.deep(removes.sort(), [obj21, obj21._iteTest].map(getId).sort(),
			"Remove reverse: Removes");
		removes.length = 0;
		a.deep(values(iterator.objects).map(getId).sort(),
			[obj11, obj11._iteTestStr, obj11._iteTestMulti,
				obj11._iteTestMulti.getItem('raz'),
				obj11._iteTestMulti.getItem('raz')._order,
				obj11._iteTestMulti.getItem('dwa'),
				obj11._iteTestMulti.getItem('dwa')._order,
				obj11._otherObj].map(getId).sort(), "Remove reverse: Total");

		obj11.otherMultipleObj.add(obj31);
		a.deep(updates.sort(), [obj11._otherMultipleObj.getItem(obj31), obj31,
			obj31._iteRemtest].map(getId).sort(), "Add obj item: Updates");
		updates.length = 0;
		a.deep(removes, [], "Add obj item: Removes");
		removes.length = 0;
		a.deep(values(iterator.objects).map(getId).sort(),
			[obj11, obj11._iteTestStr, obj11._iteTestMulti,
				obj11._iteTestMulti.getItem('raz'),
				obj11._iteTestMulti.getItem('raz')._order,
				obj11._iteTestMulti.getItem('dwa'),
				obj11._iteTestMulti.getItem('dwa')._order,
				obj11._otherObj, obj11._otherMultipleObj.getItem(obj31), obj31,
				obj31._iteRemtest].map(getId).sort(), "Add obj item: Total");

		obj11.otherMultipleObj.delete(obj31);
		a.deep(updates, [obj11._otherMultipleObj.getItem(obj31)._id_],
			"Delete obj item: Updates");
		updates.length = 0;
		a.deep(removes.sort(), [obj31, obj31._iteRemtest].map(getId).sort(),
			"Delete obj item: Removes");
		removes.length = 0;
		a.deep(values(iterator.objects).map(getId).sort(),
			[obj11, obj11._iteTestStr, obj11._iteTestMulti,
				obj11._iteTestMulti.getItem('raz'),
				obj11._iteTestMulti.getItem('raz')._order,
				obj11._iteTestMulti.getItem('dwa'),
				obj11._iteTestMulti.getItem('dwa')._order,
				obj11._otherObj,
				obj11._otherMultipleObj.getItem(obj31)].map(getId).sort(),
			"Delete obj item: Total");

		obj32 = ns3();
		obj11.otherMultipleObj.delete(obj32);
		a.deep(updates, [obj11._otherMultipleObj.getItem(obj32)._id_],
			"Invoke delete item: Updates");
		updates.length = 0;
		a.deep(removes, [], "Invoke delete item: Removes");
		removes.length = 0;
		a.deep(values(iterator.objects).map(getId).sort(),
			[obj11, obj11._iteTestStr, obj11._iteTestMulti,
				obj11._iteTestMulti.getItem('raz'),
				obj11._iteTestMulti.getItem('raz')._order,
				obj11._iteTestMulti.getItem('dwa'),
				obj11._iteTestMulti.getItem('dwa')._order,
				obj11._otherObj,
				obj11._otherMultipleObj.getItem(obj31),
				obj11._otherMultipleObj.getItem(obj32)].map(getId).sort(),
			"Invoke delete item: Total");

		ns1 = Db.create('AFragTest11');
		ns2 = Db.create('AFragTest12');
		ns3 = Db.create('AFragTest13', { foo: Db.String });
		ns4 = Db.create('AFragTest14');

		ns1.set('first', ns2);
		ns2.set('second', ns3);
		ns3.set('third', ns1);
		ns3.set('fourth', ns4);

		obj41 = ns4();
		obj33 = ns3({ third: obj11, foo: 'lorem', fourth: obj41 });
		obj21.second = obj33;
		obj11.first = obj21;

		plainObj = new Db();
		frag2 = objectFrag(plainObj);
		iterator = new T();
		iterator.add(frag2);
		iterator.add(frag);
		updates = [];
		iterator.on('update', function (event) { updates.push(event.obj._id_); });
		removes = [];
		iterator.on('remove', function (id) { removes.push(id); });

		a.deep(values(iterator.objects).map(getId).sort(),
			[obj11, obj11._iteTestStr, obj11._iteTestMulti,
				obj11._iteTestMulti.getItem('raz'),
				obj11._iteTestMulti.getItem('raz')._order,
				obj11._iteTestMulti.getItem('dwa'),
				obj11._iteTestMulti.getItem('dwa')._order,
				obj11._otherObj,
				obj11._otherMultipleObj.getItem(obj31),
				obj11._otherMultipleObj.getItem(obj32),
				obj11._first, obj21, obj21._iteTest, obj21._second, obj33,
				obj33._third, obj33._foo, obj33._fourth, obj41,
				plainObj].map(getId).sort(),
			"Circular: Initial");

		iterator.delete(frag);
		a.deep(updates.sort(), [], "Circular: Update");
		a.deep(removes.sort(), [obj11, obj11._iteTestStr, obj11._iteTestMulti,
			obj11._iteTestMulti.getItem('raz'),
			obj11._iteTestMulti.getItem('raz')._order,
			obj11._iteTestMulti.getItem('dwa'),
			obj11._iteTestMulti.getItem('dwa')._order,
			obj11._otherObj,
			obj11._otherMultipleObj.getItem(obj31),
			obj11._otherMultipleObj.getItem(obj32),
			obj11._first, obj21, obj21._iteTest, obj21._second, obj33,
			obj33._third, obj33._foo, obj33._fourth, obj41].map(getId).sort(),
			"Circular: Remove");
		a.deep(values(iterator.objects).map(getId).sort(),
			[plainObj].map(getId).sort(), "Circular: Remove: Total");
	},
	"Index Legacy": function (T, a) {
		var ns1, ns2, ns3, obj11, obj21, obj31, obj32, iterator, updates, removes
		  , frag11, frag21, frag31;

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

		iterator = new T();
		updates = [];
		iterator.on('update', function (event) { updates.push(event.obj._id_); });
		removes = [];
		iterator.on('remove', function (id) { removes.push(id); });

		// Add obj11
		frag11 = objectFrag(obj11);
		iterator.add(frag11);
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
		frag31 = objectFrag(obj31);
		iterator.add(frag31);
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
		iterator.delete(frag31);
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
		frag21 = objectFrag(obj21);
		iterator.add(frag21);
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
	}
};
