'use strict';

var root   = require('../../lib/_internals/namespace')
  , string = require('../../lib/types/string');

module.exports = function (t, a) {
	var ns1, ns2, ns3, ns5;
	ns1 = root.abstract('relsettest1', {
		foo: string.rel({ multiple: true, required: true })
	});
	a(typeof ns1.foo.has, 'function', "Namspace: set");
	a.deep(ns1.foo.toArray(), [], "Namespace: empty");
	a(ns1.foo.__count, 0, "Namespace: Count");
	a(ns1.foo.has('foo'), false, "Namespace: Has");
	a(ns1.foo.has({}), false, "Namespace: Has: Invalid");

	ns2 = ns1.abstract('relsettest2', {
		foo: ['raz', 'dwa', 13, 'trzy']
	});
	a.deep(ns2.foo.toArray().sort(), ['raz', 'dwa', '13', 'trzy'].sort(),
		"Extension: Content");
	a(ns2.foo.__count, 4, "Extension: Count");
	a(ns2.foo.has(13), true, "Extensions: Has: true");
	a(ns2.foo.has('pięć'), false, "Extensions: Has: false");

	a.deep(ns1.foo.toArray(), [], "Namespace: Not affected");
	a(ns1.foo.__count, 0, "Namespace: Not affected: Count");
	a(ns1.foo.has(13), false, "Namespace: Not affected: Has");
	ns1.foo = 'misko';
	a.deep(ns1.foo.toArray(), ['misko'], "Namespace: Reset");
	a(ns1.foo.__count, 1, "Namespace: Reset: Count");
	a(ns1.foo.has('misko'), true, "Namespace: Reset: Has: true");
	a(ns1.foo.has('pięć'), false, "Namespace: Reset: Has: false");
	ns1.foo.add('marko');
	a.deep(ns1.foo.toArray().sort(), ['marko', 'misko'], "Namespace: Add");
	a(ns1.foo.__count, 2, "Namespace: Add: Count");
	a(ns1.foo.has('marko'), true, "Namespace: Add: Has: true");
	a(ns1.foo.has('pięć'), false, "Namespace: Add: Has: false");

	a.deep(ns2.foo.toArray().sort(), ['raz', 'dwa', '13', 'trzy'].sort(),
		"Extension: Not Affected");
	a(ns2.foo.__count, 4, "Extension: Not affected: Count");
	a(ns2.foo.has('dwa'), true, "Extension: Not affected: Has: true");
	a(ns2.foo.has('marko'), false, "Extension: Not affected: Has: false");

	ns2.foo = undefined;
	a.deep(ns2.foo.toArray().sort(), ['marko', 'misko'].sort(),
		"Extension: Fallback");
	a(ns2.foo.__count, 0, "Extension: Fallback: Count");
	a(ns2.foo.has('marko'), true, "Extension: Fallback: Has: true");
	a(ns2.foo.has('raz'), false, "Extension: Fallback: Has: false");

	ns1.foo.add('next');
	a.deep(ns2.foo.toArray().sort(), ['marko', 'misko', 'next'].sort(),
		"Extension: Fallback: Parent add");
	a(ns2.foo.__count, 0, "Extension: Fallback: Parent add: Count");
	a(ns2.foo.has('next'), true, "Extension: Fallback: Parent add: Has: true");
	a(ns2.foo.has('raz'), false, "Extension: Fallback: Parent add: Has: false");

	ns2.foo.add('lorem');
	a.deep(ns1.foo.toArray().sort(), ['marko', 'misko', 'next'].sort(),
		"Extension: Fallback: Add: Namespace: Not affected");
	a(ns1.foo.__count, 3,
		"Extension: Fallback: Add: Namespace: Not affected: Count");
	a(ns1.foo.has('misko'), true,
		"Extension: Fallback: Add: Namespace: Not affected: Has: true");
	a(ns1.foo.has('lorem'), false,
		"Extension: Fallback: Add: Namespace: Not affected: Has: false");
	a.deep(ns2.foo.toArray().sort(), ['marko', 'misko', 'next', 'lorem'].sort(),
		"Extension: Fallback: Add: Content");
	a(ns2.foo.__count, 1, "Extension: Fallback: Add: Count");
	a(ns2.foo.has('lorem'), true,
		"Extension: Fallback: Add: Has: true");
	a(ns2.foo.has('trzy'), false,
		"Extension: Fallback: Add: Has: false");

	ns2.foo.remove('misko');
	a.deep(ns1.foo.toArray().sort(), ['marko', 'misko', 'next'].sort(),
		"Extension: Fallback: Remove: Namespace: Not affected");
	a(ns1.foo.__count, 3,
		"Extension: Fallback: Remove: Namespace: Not affected: Count");
	a(ns1.foo.has('misko'), true,
		"Extension: Fallback: Remove: Namespace: Has: true");
	a(ns1.foo.has('lorem'), false,
		"Extension: Fallback: Remove: Namespace: Has: false");
	a.deep(ns2.foo.toArray().sort(), ['marko', 'next', 'lorem'].sort(),
		"Extension: Fallback: Remove: Content");
	a(ns2.foo.__count, 1, "Extension: Fallback: Remove: Count");
	a(ns2.foo.has('next'), true,
		"Extension: Fallback: Remove: Has: true");
	a(ns2.foo.has('misko'), false,
		"Extension: Fallback: Remove: Has: false");

	ns3 = ns2.abstract('reltest3');
	a.deep(ns3.foo.toArray().sort(), ['marko', 'next', 'lorem'].sort(),
		"2nd Extension: Fallback: Content");
	a(ns3.foo.__count, 0, "2nd Extension: Count");
	a(ns3.foo.has('marko'), true,
		"2nd Extension: Fallback: Has: true");
	a(ns3.foo.has('misko'), false,
		"2nd Extension: Fallback: Has: false");

	ns3.foo.add('topl');
	a.deep(ns1.foo.toArray().sort(), ['marko', 'misko', 'next'].sort(),
		"2nd Extension: Fallback: Add: Namespace: Not affected");
	a(ns1.foo.__count, 3,
		"2nd Extension: Fallback: Add: Namespace: Not affected: Count");
	a(ns1.foo.has('marko'), true,
		"2nd Extension: Fallback: Add: Namespace: Has: true");
	a(ns1.foo.has('topl'), false,
		"2nd Extension: Fallback: Add: Namespace: Has: false");
	a.deep(ns2.foo.toArray().sort(), ['marko', 'next', 'lorem'].sort(),
		"2nd Extension: Fallback: Add: Extension: Not affected");
	a(ns2.foo.__count, 1, "2nd Extension: Fallback: Extension: Count");
	a(ns2.foo.has('marko'), true,
		"2nd Extension: Fallback: Add: Extension: Has: true");
	a(ns2.foo.has('topl'), false,
		"2nd Extension: Fallback: Add: Extension: Has: false");
	a.deep(ns3.foo.toArray().sort(), ['marko', 'next', 'lorem', 'topl'].sort(),
		"2nd Extension: Fallback: Add: Content");
	a(ns3.foo.__count, 1, "2nd Extension: Fallback: Add: Count");
	a(ns3.foo.has('topl'), true,
		"2nd Extension: Fallback: Add: Has: true");
	a(ns3.foo.has('misko'), false,
		"2nd Extension: Fallback: Add: Has: false");

	ns3.foo.remove('marko');
	a.deep(ns1.foo.toArray().sort(), ['marko', 'misko', 'next'].sort(),
		"2nd Extension: Fallback: Remove: Namespace: Not affected");
	a(ns1.foo.__count, 3,
		"2nd Extension: Fallback: Remove: Namespace: Not affected: Count");
	a(ns1.foo.has('marko'), true,
		"2nd Extension: Fallback: Remove: Namespace: Has: true");
	a(ns1.foo.has('topl'), false,
		"2nd Extension: Fallback: Remove: Namespace: Has: false");
	a.deep(ns2.foo.toArray().sort(), ['marko', 'next', 'lorem'].sort(),
		"2nd Extension: Fallback: Remove: Extension: Not affected");
	a(ns2.foo.__count, 1, "2nd Extension: Fallback: Extension: Count");
	a(ns2.foo.has('marko'), true,
		"2nd Extension: Fallback: Remove: Extension: Has: true");
	a(ns2.foo.has('topl'), false,
		"2nd Extension: Fallback: Remove: Extension: Has: false");
	a.deep(ns3.foo.toArray().sort(), ['next', 'lorem', 'topl'].sort(),
		"2nd Extension: Fallback: Remove: Content");
	a(ns3.foo.__count, 1, "2nd Extension: Fallback: Remove: Count");
	a(ns3.foo.has('topl'), true,
		"2nd Extension: Fallback: Remove: Has: true");
	a(ns3.foo.has('marko'), false,
		"2nd Extension: Fallback: Remove: Has: false");

	ns2.foo.remove('lorem');
	a.deep(ns1.foo.toArray().sort(), ['marko', 'misko', 'next'].sort(),
		"2nd Extension: Fallback: Mid remove: Namespace: Not affected");
	a(ns1.foo.__count, 3,
		"2nd Extension: Fallback: Mid remove: Namespace: Not affected: Count");
	a(ns1.foo.has('marko'), true,
		"2nd Extension: Fallback: Mid remove: Namespace: Has: true");
	a(ns1.foo.has('lorem'), false,
		"2nd Extension: Fallback: Mid remove: Namespace: Has: false");
	a.deep(ns2.foo.toArray().sort(), ['marko', 'next'].sort(),
		"2nd Extension: Fallback: Mid remove: Extension: Content");
	a(ns2.foo.__count, 0, "2nd Extension: Fallback: Extension: Count");
	a(ns2.foo.has('marko'), true,
		"2nd Extension: Fallback: Mid remove: Extension: Has: true");
	a(ns2.foo.has('lorem'), false,
		"2nd Extension: Fallback: Mid remove: Extension: Has: false");
	a.deep(ns3.foo.toArray().sort(), ['next', 'topl'].sort(),
		"2nd Extension: Fallback: Mid remove: Content");
	a(ns3.foo.__count, 1, "2nd Extension: Fallback: Mid remove: Count");
	a(ns3.foo.has('topl'), true,
		"2nd Extension: Fallback: Mid remove: Has: true");
	a(ns3.foo.has('loddrem'), false,
		"2nd Extension: Fallback: Mid remove: Has: false");

	ns2._foo.multiple = false;
	a.deep(ns1.foo.toArray().sort(), ['marko', 'misko', 'next'].sort(),
		"2nd Extension: Fallback: Mid single: Namespace: Not affected");
	a(ns1.foo.__count, 3,
		"2nd Extension: Fallback: Mid single: Namespace: Not affected: Count");
	a(ns1.foo.has('marko'), true,
		"2nd Extension: Fallback: Mid single: Namespace: Has: true");
	a(ns1.foo.has('lorem'), false,
		"2nd Extension: Fallback: Mid single: Namespace: Has: false");
	a(ns2.foo, 'next',
		"2nd Extension: Fallback: Mid single: Extension: Content");
	a(ns3.foo, 'next', "2nd Extension: Fallback: Mid single: Content");

	ns3._foo.multiple = true;
	a.deep(ns1.foo.toArray().sort(), ['marko', 'misko', 'next'].sort(),
		"2nd Extension: Fallback: Top multiple: Namespace: Not affected");
	a(ns1.foo.__count, 3,
		"2nd Extension: Fallback: Top multiple: Namespace: Not affected: Count");
	a(ns1.foo.has('marko'), true,
		"2nd Extension: Fallback: Top multiple: Namespace: Has: true");
	a(ns1.foo.has('lorem'), false,
		"2nd Extension: Fallback: Top multiple: Namespace: Has: false");
	a(ns2.foo, 'next',
		"2nd Extension: Fallback: Top multiple: Extension: Content");
	a.deep(ns3.foo.toArray().sort(), ['next', 'topl'].sort(),
		"2nd Extension: Fallback: Top multiple: Content");
	a(ns3.foo.__count, 1, "2nd Extension: Fallback: Top multiple: Count");
	a(ns3.foo.has('next'), true,
		"2nd Extension: Fallback: Top multiple: Has: true");
	a(ns3.foo.has('lorem'), false,
		"2nd Extension: Fallback: Top multiple: Has: false");

	ns2.foo = 'radzio';
	a.deep(ns1.foo.toArray().sort(), ['marko', 'misko', 'next'].sort(),
		"2nd Extension: Fallback: Set middle: Namespace: Not affected");
	a(ns1.foo.__count, 3,
		"2nd Extension: Fallback: Set middle: Namespace: Not affected: Count");
	a(ns1.foo.has('marko'), true,
		"2nd Extension: Fallback: Set middle: Namespace: Has: true");
	a(ns1.foo.has('lorem'), false,
		"2nd Extension: Fallback: Set middle: Namespace: Has: false");
	a(ns2.foo, 'radzio',
		"2nd Extension: Fallback: Set middle: Extension: Content");
	a.deep(ns3.foo.toArray().sort(), ['radzio', 'topl'].sort(),
		"2nd Extension: Fallback: Set middle: Content");
	a(ns3.foo.__count, 1, "2nd Extension: Fallback: Set middle: Count");
	a(ns3.foo.has('radzio'), true,
		"2nd Extension: Fallback: Set middle: Has: true");
	a(ns3.foo.has('lorem'), false,
		"2nd Extension: Fallback: Set middle: Has: false");

	ns2._foo.multiple = true;
	a.deep(ns1.foo.toArray().sort(), ['marko', 'misko', 'next'].sort(),
		"2nd Extension: Fallback: Mid multiple: Namespace: Not affected");
	a(ns1.foo.__count, 3,
		"2nd Extension: Fallback: Mid multiple: Namespace: Not affected: Count");
	a(ns1.foo.has('marko'), true,
		"2nd Extension: Fallback: Mid multiple: Namespace: Has: true");
	a(ns1.foo.has('lorem'), false,
		"2nd Extension: Fallback: Mid multiple: Namespace: Has: false");
	a.deep(ns2.foo.toArray(), ['radzio'],
		"2nd Extension: Fallback: Mid multiple: Extension: Content");
	a(ns2.foo.__count, 1,
		"2nd Extension: Fallback: Mid multiple: Extension: Count");
	a(ns2.foo.has('radzio'), true,
		"2nd Extension: Fallback: Mid multiple: Extension: Has: true");
	a(ns2.foo.has('lorem'), false,
		"2nd Extension: Fallback: Mid multiple: Extension: Has: false");
	a.deep(ns3.foo.toArray().sort(), ['radzio', 'topl'].sort(),
		"2nd Extension: Fallback: Mid multiple: Content");
	a(ns3.foo.__count, 1, "2nd Extension: Fallback: Mid multiple: Count");
	a(ns3.foo.has('radzio'), true,
		"2nd Extension: Fallback: Mid multiple: Has: true");
	a(ns3.foo.has('lorem'), false,
		"2nd Extension: Fallback: Mid multiple: Has: false");

	ns5 = ns3.abstract('reltest4').abstract('reltest5');
	a(ns5.foo.has('radzio'), true, "Deep extension: Has: true");
	a(ns5.foo.has('lorem'), false, "Deep extension: Has: false");
};
