const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')
const env = require('../env')

const entry = env.entry
const browsers = JSON.stringify({ browsers: [ "IOS >= 7", "Android >= 4" ] })
const cssLoader = `style!css?importLoaders=1&sourceMap!autoprefixer?${browsers}`

module.exports = {
  devtool: 'cheap-module-eval-source-map',
  entry,
  output: {
    path: env.publicPath,
    filename: 'bundle.js',
    publicPath: '/'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify('development')
    }),
    new webpack.ProvidePlugin({
      riot: 'riot'
    })
    // new HtmlWebpackPlugin({
    //   template: './server/views/index.html'
    // })
  ],
  resolve: {
    extensions: [ '', '.js', '.tag' ]
  },
  module: {
    loaders: [
      {
        test: /\.hbs$/,
        loader: "handlebars"
      },
      {
        test: /\.js$/,
        loader: 'babel',
        exclude: /node_modules/
      },
      {
        test: /\.tag$/,
        loader: 'riotjs',
        exclude: /node_modules/
      },
      {
        test: /\.scss$/,
        loader: `${cssLoader}!sass`,
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        loader: cssLoader
      },
      // #TODO:0 为其他类型文件添加loader，比如字体文件，或者图片等 +webpack @dev
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: "url?limit=10000&mimetype=application/font-woff"
      },
      {
        test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: "file"
      }
    ]
  },
  sassLoader: {
    includePaths: [
      path.resolve(__dirname, "../../node_modules/normalize-scss/sass/"),
      path.resolve(__dirname, "../../node_modules/support-for/sass/"),
      path.resolve(__dirname, "../../src/__shared/sass/")
    ]
  }
}
