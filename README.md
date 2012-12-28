# dbjs - In-Memory Database Engine for JavaScript

_…Full documentation coming soon…_

```javascript
var Db = require('dbjs');

var Person = Db.create('Person', {
	firstName: Db.String.required,
	lastName: Db.String.required,
	fullName: Db.String.rel({ value: function () {
		return this.firstName + ' ' + this.lastname;
	}, triggers: ['firstName', 'lastName'], required: true })
});

var john = new Person({ firstName: 'John', lastName: 'Smith' });

console.log(john.fullName); // 'John Smith';

try {
	john.fistName = null;
} catch (e) {
	console.log("Cannot remove required property");
};

john._lastName.on('update', function (nu, old) {
	console.log("Changed lastName from " + old + " to " + new)
});

john._fullName.on('update', function (nu, old) {
	console.log("Changed fullName from " + old + " to " + new)
});

john.lastName = 'Kowalski';
```

## Installation
### NPM

In your project path:

	$ npm install medikoo/dbjs

### Browser

You can easily bundle NPM packages for browser with [modules-webmake](https://github.com/medikoo/modules-webmake)

## Tests

	$ npm test
