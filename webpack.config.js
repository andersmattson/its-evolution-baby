const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
	mode: 'production',
	entry: './src/main.js',
	output: {
		path: path.resolve(__dirname, 'docs'),
		filename: 'bundle.js'
	},
	devServer: {
		static: {
			directory: path.join(__dirname, 'docs'),
		}
	},
	plugins: [
		new HtmlWebpackPlugin({
			filename: 'index.html',
			template: 'template.html',
			inject: 'body'
		})
	]
}