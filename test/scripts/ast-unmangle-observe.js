'use strict';

module.exports = function (t, a) {
	var unmangled = { type: 'VariableDeclaration',
		declarations:
		[ { type: 'VariableDeclarator',
			id: { type: 'Identifier', name: 'raz' },
			init:
			{ type: 'FunctionExpression',
				id: null,
				params: [ { type: 'Identifier', name: '_observe' } ],
				defaults: [],
				body:
				{ type: 'BlockStatement',
					body:
					[ { type: 'ExpressionStatement',
						expression:
						{ type: 'CallExpression',
							callee: { type: 'Identifier', name: '_observe' },
							arguments: [ { type: 'Identifier', name: 'dwa' } ] } } ] },
				rest: null,
				generator: false,
				expression: false } } ],
		kind: 'var' }
	  , mangled = { type: 'VariableDeclaration',
			declarations:
			[ { type: 'VariableDeclarator',
				id: { type: 'Identifier', name: 'raz' },
				init:
				{ type: 'FunctionExpression',
					id: null,
					params: [ { type: 'Identifier', name: 'a' } ],
					defaults: [],
					body:
					{ type: 'BlockStatement',
						body:
						[ { type: 'ExpressionStatement',
							expression:
							{ type: 'CallExpression',
								callee: { type: 'Identifier', name: 'a' },
								arguments: [ { type: 'Identifier', name: 'dwa' } ] } } ] },
					rest: null,
					generator: false,
					expression: false } } ],
			kind: 'var' };

	a(t(mangled, unmangled), mangled, "Return");

	a.deep(mangled, { type: 'VariableDeclaration',
		declarations:
		[ { type: 'VariableDeclarator',
			id: { type: 'Identifier', name: 'raz' },
			init:
			{ type: 'FunctionExpression',
				id: null,
				params: [ { type: 'Identifier', name: '_observe' } ],
				defaults: [],
				body:
				{ type: 'BlockStatement',
					body:
					[ { type: 'ExpressionStatement',
						expression:
						{ type: 'CallExpression',
							callee: { type: 'Identifier', name: '_observe' },
							arguments: [ { type: 'Identifier', name: 'dwa' } ] } } ] },
				rest: null,
				generator: false,
				expression: false } } ],
		kind: 'var' });
};
