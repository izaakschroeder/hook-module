# hook-module

Hook node module loading internals to do your bidding.

![build status](http://img.shields.io/travis/izaakschroeder/hook-module/master.svg?style=flat&branch=master)
![coverage](http://img.shields.io/coveralls/izaakschroeder/hook-module/master.svg?style=flat&branch=master)
![license](http://img.shields.io/npm/l/hook-module.svg?style=flat)
![version](http://img.shields.io/npm/v/hook-module.svg?style=flat)
![downloads](http://img.shields.io/npm/dm/hook-module.svg?style=flat)

You know those times when someone says "this is probably a terrible idea"? Yea. This is one of those. If you think you have a use case for this module you probably don't.

Right now it's being used to load modules from webpack's in-memory filesystem, which would otherwise be impossible to do.

```javascript
var hijack = require('hook-module');

var hook = hijack({
	// Whether or not the hook starts enabled or not.
	enabled: true,
	// Test determines whether or not the hook is applied to a given module
	// request. Pass true to hook everything, a regular expression or array
	// of extensions or a function to hook only those matching. Omit this
	// to always apply your hook.
	test: /\.(js|es6|es|jsx)$/,
	// If you need a custom resolver pass it here. A function that takes as
	// input (request, parent). If omitted, just use node's default resolver.
	resolve: null,
	// Where the magic happens. Transform the module to your liking. when
	// you are done, simply assign module.exports to the value you want the
	// module to have.
	handler: function(module, filename) {
		module.exports = 'black magic';
	}
});

// Turn the hook off.
hook.disable();

// Turn the hook on.
hook.enable();
```

TODO:
 * [ ] More tests
