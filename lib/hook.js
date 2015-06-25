
// http://stackoverflow.com/questions/17581830
// https://github.com/babel/babel/blob/master/src/babel/api/register/node.js
// https://github.com/joyent/node/blob/master/lib/module.js

var path = require('path');
var Module = module.constructor;

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
 * @returns {Function} Function to remove the hook.
 */
function hook(options) {

	// Default to the node built-in resolver if none is provided.
	if (!options.resolve) {
		options.resolve = Module._resolveFilename;
	}

	// Keep an old copy of the loader around.
	var load = Module._load;

	// Here we go.
	Module._load = function loader(request, parent) {

		// Check first to see if the hook should be applied; if not then just
		// pass the request to the old loading code.
		if (!options.test(request, parent)) {
			return load.apply(Module, arguments);
		}

		// Resolve the filename from the module request
		var filename = options.resolve(request, parent);

		var cachedModule = Module._cache[filename];

		if (cachedModule) {
			return cachedModule.exports;
		}

		var module = new Module(filename, parent);
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

	// Restore hook.
	return function restore() {
		Module._load = load;
	}
}

// Forgive us.
module.exports = hook;
