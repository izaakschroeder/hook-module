# hook-module

Hook node module loading internals to do your bidding.

You know those times when someone says "this is probably a terrible idea"? Yea. This is one of those. If you think you have a use case for this module you probably don't. You have been warned.

Right now it's being used to load modules from webpack's in-memory filesystem, which would otherwise be impossible to do.

```javascript
var hook = require('hook-module');

hook({
	// Test determines whether or not the hook is applied to a given module
	// request. Pass true to hook everything, a regular expression or array
	// of extensions or a function to hook only those matching.
	test: /\.(js|es6|es|jsx)$/,
	// If you need a custom resolver pass it here. A function that takes as
	// input (request, parent).
	resolve: null,
	// Where the magic happens. Transform the module to your liking.
	handler: function(module, filename) {

	}
})
```
TODO:
 * [ ] Tests
