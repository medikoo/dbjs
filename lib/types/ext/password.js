// Must not be used on client-side.

'use strict';

var promisify = require('deferred').promisify
  , bcrypt    = require('bcrypt')
  , base      = require('../base')
  , number    = require('../number')
  , string    = require('../string')

  , genSalt = promisify(bcrypt.genSalt), hash = promisify(bcrypt.hash)
  , compare = promisify(bcrypt.compare);

module.exports = string.create('password', {
	async: true,
	min: 5,
	pattern: /(?=[\0-\uffff]*\d)(?=[\0-\uffff]*[a-zA-Z])/,
	rounds: number.rel({ value: 10 }),
	compare: base.function.rel({ value: function (password, hash) {
		return compare(password, hash);
	} }),
	validate: function (value) {
		return hash(string.validate.call(this, value), genSalt(this.rounds || 10));
	}
});
