var path = require('path');
var root = process.cwd();
var webpack = require('webpack');

module.exports = {
	entry: {
		server: [
			'./server',
			'webpack/hot/signal?hot-module-update'
		]
	},
	node: {
		__dirname: true,
		__filename: true
	},
	module: {
		loaders: [{
			name: 'json5',
			test: /\.json5?$/,
			loader: 'json5'
		}]
	},
	target: 'node',
	context: root,
	output: {
		filename: '[name].[hash].js',
		path: path.join(root, 'build', 'server'),
		chunkFilename: '[id].[hash].js'
	},
	plugins: [
		new webpack.HotModuleReplacementPlugin()
	]
};
