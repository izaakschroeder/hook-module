
var path = require('path');
var webpack = require('webpack');
var _ = require('lodash');
var MemoryFileSystem = require('memory-fs');
var config = require('./webpack.config');
var compiler = webpack(config);
var hook = require('hook-module');

var fs = compiler.outputFileSystem = new MemoryFileSystem();

var root = config.output.path;

// We only care about requests coming to things webpack generates; the
// entrypoints are always absolute paths, so just check that they belong to
// the root; handle hot-updates specially since they are requested relatively.
function isWebpackAssetRequest(request, parent) {
	return /^\.\/.*\.hot-update\.(json|js)$/.test(request) ||
	 	(request.charAt(0) === '/' && request.substr(0, root.length) === root);
}

// Note that memory-fs ONLY handles requests for absolute paths. This means
// that whatever gets returned here has to be an absolute path. So if it's
// already an absolute path return that, otherwise map the request to the
// webpack output directory.
function resolveWebpackAsset(request, parent) {
	if (request.charAt(0) === '/') {
		return request;
	} else {
		return path.resolve(root, request);
	}
}

// No fancy loading; just the standard .js/.json types; the only difference is
// that their data comes from the memory-fs.
function handleWebpackAsset(module, filename) {
	var data = fs.readFileSync(filename, 'utf8');
	if (path.extname(filename) === '.json') {
		module.exports = JSON.parse(data);
	} else {
		module._compile(data);
	}
}

// Lift-off.
hook({
	test: isWebpackAssetRequest,
	resolve: resolveWebpackAsset,
	handler: handleWebpackAsset
});

compiler.plugin('done', function(stats) {
	// Signal HMR to self
	process.emit('hot-module-update', stats);
});

compiler.watch({
    aggregateTimeout: 300,
}, _.once(function(err, stats) {
	if (err) {
		throw err;
	}

	var map = stats.toJson({ assets: true}).assetsByChunkName;
	var modules = _.mapValues(map, function(asset) {
		return path.join(root, asset);
	});

	require(modules.server);
}));
