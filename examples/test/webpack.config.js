const path = require("path");
const webpack = require('webpack');

module.exports = {
	entry: {
		app: './app-client.js'
	},
	output: {
		path: path.join(__dirname, 'public'),
		publicPath: '/',
		filename: '[name].js'
	},
	target: 'web',
	devtool: 'source-map',
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: "babel-loader",
			},
		]
	}
};