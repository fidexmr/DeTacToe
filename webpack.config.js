const { triggerAsyncId } = require('async_hooks');
const path = require('path');

module.exports = {
  entry: './src/index.js',
  mode: "development",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  devtool: 'source-map',
  devServer: {
    port: 8080,
    hot: true,
    open: true,
    static: path.resolve(__dirname)
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname),
  },
};