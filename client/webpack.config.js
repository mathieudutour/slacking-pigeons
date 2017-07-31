const path = require('path')
const webpack = require('webpack')

const PRODUCTION = process.argv.indexOf('-p') !== -1;

const config = {
  entry: "./index.tsx",
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, '../server/dist/static')
  },
  devtool: "source-map",
  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: [".ts", ".tsx", ".js", ".json"]
  },
  module: {
    rules: [
      // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
      { test: /\.tsx?$/, loader: "awesome-typescript-loader" },

      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(PRODUCTION ? 'production' : 'development'),
        'SERVER_HOST': JSON.stringify(process.env.SERVER_HOST || 'http://localhost:4000')
      }
    }),
  ]
};

if (PRODUCTION) {
  config.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        screw_ie8: true
      }
    })
  )
} else {
  config.devServer = {
    contentBase: path.resolve(__dirname, '../server/dist/static'),
    hot: true,
    inline: true,
    host: "0.0.0.0",
    port: 2708
  }
  config.plugins.push(
    new webpack.HotModuleReplacementPlugin()
  );
}

module.exports = config
