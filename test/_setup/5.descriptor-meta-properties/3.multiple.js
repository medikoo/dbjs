'use strict';

var toArray  = require('es5-ext/array/to-array')
  , isSet    = require('es6-set/is-set')
  , Database = require('../../../');

module.exports = function (a) {
	var db = new Database(), obj = new db.Object(), desc = obj.$getOwn('test')
	  , event, set, user, users;

	obj.test = 234;
	desc.multiple = true;
	a(isSet(set = obj.test), true, "Multiple");
	a.deep(toArray(obj.test), [], "Value");

	obj._test.on('change', function (e) { event = e; });
	desc.multiple = false;
	a.deep(event, { type: 'change', newValue: 234, oldValue: set,
		dbjs: event.dbjs, target: obj._test }, "Force udpate");
	a(obj.test, 234, "Multiple: false");

	db.Object.extend('User', {
		roles: {
			type: db.String,
			multiple: true
		}
	});
	user = new db.User({ roles: ['user'] });
	users = db.User.find('roles', 'user');
	a.deep(toArray(users), [user]);
	user._setValue_(null);
	a.deep(toArray(users), []);
	user._setValue_(db.User.prototype);
	a(users.size, 1);
	a.deep(toArray(users), [user]);
};
