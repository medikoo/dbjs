'use strict';

module.exports = function (t, a) {
	var id = 'raz:dwa:3sdfasffef".razdwa';
	a(id.slice(t(id)), '".razdwa', "#1");
	id = 'raz:dwa:2df\\\\sdf\\\\\\\\sdf\\"sdf".fasf';
	a(id.slice(t(id)), '".fasf', "#2");
	id = 'raz:dwa:2df\\\\sdf\\\\\\\\sdf\\"".fsasf';
	a(id.slice(t(id)), '".fsasf', "#3");
	id = 'raz:dwa:2df\\\\sdf\\\\\\\\sdf\\"\\\\\\\\".fasasf';
	a(id.slice(t(id)), '".fasasf', "#4");
};
