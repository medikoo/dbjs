// Must not be used on client-side.

'use strict';

var promisify = require('deferred').promisify
  , bcrypt    = require('bcrypt')
  , db        = require('../dbjs')

  , genSalt = promisify(bcrypt.genSalt), hash = promisify(bcrypt.hash)
  , compare = promisify(bcrypt.compare)

  , string = db.string;

module.exports = string.create('password', {
	async: true,
	min: 5,
	pattern: /(?=[\0-\uffff]*\d)(?=[\0-\uffff]*[a-zA-Z])/,
	rounds: db.number.rel({ default: 10 }),
	compare: db.function.rel({ default: function (password, hash) {
		return compare(password, hash);
	} }),
	validate: function (value) {
		return hash(string.validate.call(this, value), genSalt(this.rounds || 10));
	}
});
