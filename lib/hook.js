
// http://stackoverflow.com/questions/17581830
// https://github.com/babel/babel/blob/master/src/babel/api/register/node.js
// https://github.com/joyent/node/blob/master/lib/module.js

var path = require('path');
var Module = module.constructor;

var load = Module._load;
var hooks = [ {
	load: load,
	enabled: true,
	test: function() {
		return true;
	}
} ];

// Here we go.
Module._load = function(request, parent) {
	for (var i = 0; i < hooks.length; ++i) {
		if (hooks[i].test.apply(null, arguments)) {
			break;
		}
	}
	return hooks[i].load.apply(hooks[i], arguments);
}

function normalizeTest(input) {
	if (!input) {
		return function() {
			return true;
		};
	} else if (typeof input === 'function') {
		return input;
	} else if (input instanceof RegExp) {
		return function(request) {
			return input.test(request);
		};
	} else if (typeof input === 'string') {
		return function(request) {
			return request === input;
		};
	} else if (Array.isArray(input)) {
		var tests = input.map(normalizeTest);
		return function() {
			var args = arguments;
			return tests.some(function(test) {
				return test.apply(null, args);
			});
		}
	} else {
		throw new TypeError('Invalid test.');
	}
}

/**
 * Hook the module loading infrastructure of node. God help you if you ever
 * decide to use this for anything other than development and experimentation.
 * Most of this implementation is lifted straight from node's Module._load
 * including using various internal properties. This naturally means that if
 * node decides to change things this will totally blow up your computer.
 * It also totally bypasses the extension hooks. If you have any of those
 * your hooked module will never call them. I ain't even mad.
 * @param {Object} options Configuration options.
 * @param {Array|RegExp|Function} options.test Resolves true to hook module.
 * @param {Function} options.handler Manipulate the module.
 * @param {Function} options.resolve Resolve initial module request.
 * @returns {Object} Resulting hook.
 */
function createHook(options) {

	var test, resolve;

	// Default to the node built-in resolver if none is provided.
	resolve = options.resolve || Module._resolveFilename;
	test = normalizeTest(options.test);

	var hook = {
		modules: { },

		test: test,
		resolve: resolve,

		enable: function add() {
			if (hooks.indexOf(this) === -1) {
				hooks.unshift(this);
			}
		},

		disable: function remove() {
			var entry = hooks.indexOf(this);
			for (var module in this.modules) {
				delete Module._cache[module];
				delete this.modules[module];
			}
			if (entry !== -1) {
				hooks.splice(entry, 1);
			}
		},

		load: function loader(request, parent) {

			// Resolve the filename from the module request
			var filename = options.resolve(request, parent);

			var cachedModule = Module._cache[filename];

			if (cachedModule) {
				return cachedModule.exports;
			}

			var module = new Module(filename, parent);
			this.modules[filename] = module;
			Module._cache[filename] = module;

			var hadException = true;

			try {
				module.filename = filename;
				module.paths = Module._nodeModulePaths(path.dirname(filename));
				options.handler(module, filename);
				module.loaded = true;
				hadException = false;
			} finally {
				if (hadException) {
					delete Module._cache[filename];
				}
			}

			return module.exports;
		}
	};

	if ((typeof options.enabled === 'undefined') || options.enabled) {
		hook.enable();
	}

	return hook;
}

// Forgive us.
module.exports = createHook;
