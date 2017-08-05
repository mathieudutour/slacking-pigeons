const path = require('path')
const webpack = require('webpack')

const PRODUCTION = process.argv.indexOf('-p') !== -1;

const config = {
  entry: "./src/index.tsx",
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, '../server/dist/static')
  },
  resolve: {
    "alias": {
      "react": "preact-compat",
      "react-dom": "preact-compat"
    },
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: [".ts", ".tsx", ".js", ".json"]
  },
  module: {
    rules: [
      // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
      { test: /\.tsx?$/, use: [
          {
            loader: 'awesome-typescript-loader',
            options: {
              useCache: true,
            },
          },
        ]
      },

      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      { enforce: "pre", test: /\.js$/, loader: "source-map-loader" },
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(PRODUCTION ? 'production' : 'development'),
        'SERVER_HOST': JSON.stringify(process.env.SERVER_HOST || 'http://localhost:4000'),
        'COLOR': JSON.stringify(process.env.COLOR || '#3ead3f')
      }
    }),
  ]
};

if (!PRODUCTION) {
  config.devtool = 'inline-source-map'
  config.devServer = {
    hot: true,
    inline: true,
    host: "0.0.0.0",
    port: 2708
  }
  config.plugins.push(
    new webpack.HotModuleReplacementPlugin()
  )
}

module.exports = config
