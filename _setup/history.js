'use strict';

var setPrototypeOf  = require('es5-ext/object/set-prototype-of')
  , d               = require('d/d')
  , ObservableArray = require('observable-array/create-read-only')(
	require('observable-array')
)
  , unshift = Array.prototype.unshift
  , History;

History = module.exports = function (length) {
	return ObservableArray.call(this);
};
setPrototypeOf(History, ObservableArray);

History.prototype = Object.create(ObservableArray.prototype, {
	constructor: d(History),
	_add_: d(function (event) {
		var previous = this[0], index, l, other;

		if (previous) {
			if (previous.stamp > event.stamp) {
				// Outdated event, add to history if applicable and quit

				l = this.length;
				index = 1;
				while ((index < l) && (this[index].stamp > event.stamp)) ++index;
				if (index === l) {
					this._set(index, event);
					return;
				}
				other = this[index];
				if ((other.stamp === event.stamp) && (other.value === event.value) &&
						(other.sourceId === event.sourceId)) {
					// Duplicate event (should not happen), ignore
					return;
				}
				this._splice(index, 0, event);
				return;
			}

			if ((previous.stamp === event.stamp) &&
					(previous.sourceId === event.sourceId) &&
					(previous.value === event.value)) {
				// Duplicate event (should not happen), ignore
				return;
			}

			// Update
			unshift.call(this, event);
			event.object._setValue_(event.value, event);
			this.emit('change', { type: 'unshift', values: [event] });

		} else {

			// First event for object
			this[0] = event;
			event.object._setValue_(event.value, event);
			this.emit('change', { type: 'set', index: 0, value: event });
		}

		// Emit on master and main objects collection
		event.object.__object__.emit('update', event);
		event.object._db_.objects.emit('update', event);
	})
});
