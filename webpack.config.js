const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = (env) => {
	
	if( env.production ){
		return {
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
		};
	} else {
		return {
			mode: 'development',
			entry: './src/main.js',
			devtool: 'inline-source-map',
			output: {
				path: path.resolve(__dirname, 'docs'),
				filename: 'bundle-[hash].js'
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
	}
}