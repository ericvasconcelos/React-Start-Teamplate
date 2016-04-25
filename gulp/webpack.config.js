var config = require('./config');
var environments = require('./environments.json');
var glob = require('glob');
var path = require('path');
var webpack = require('webpack');

var nodeEnv = process.env.NODE_ENV;
var environment = process.env.ENVIRONMENT;

var fileNames = [];
var filePaths = glob.sync(config.scripts.apps.baseDir + '/*.jsx');

var commonPaths = [
  path.resolve(__dirname, '../app/scripts/vendor/_base.js')
];

var entries = { common: commonPaths };
var plugins = [
  new webpack.optimize.OccurenceOrderPlugin(),
  new webpack.DefinePlugin({
    'process.env': { NODE_ENV: JSON.stringify(nodeEnv) },
    config: {
      // api: {
      //   baseURL: JSON.stringify(environments[environment].api.baseURL)
      // }
    },
    environment: JSON.stringify(environment)
  })
];

filePaths.forEach(function(filePath) {
  var fileName = /\/([a-z-]+).jsx$/g.exec(filePath)[1];
  var finalFilePath = path.resolve(__dirname, '.' + filePath);

  fileNames.push(fileName);

  if (nodeEnv === 'development') {
    entries[fileName] = [ finalFilePath, 'webpack-hot-middleware/client' ];
  } else {
    entries[fileName] = finalFilePath;
  }
});

plugins.push(new webpack.optimize.CommonsChunkPlugin({
  name: 'common',
  chunks: fileNames,
  // - 2 removes version and landing from the game
  // If components are used by every page it became common
  // Ex: header, footer, utils...
  minChunks: fileNames.length - 2
}));

if (nodeEnv === 'development') {
  plugins.push(new webpack.HotModuleReplacementPlugin());
} else {
  plugins.push(new webpack.optimize.DedupePlugin());
  plugins.push(new webpack.NoErrorsPlugin());
}

if (nodeEnv === 'production') {
  plugins.push(new webpack.optimize.UglifyJsPlugin({
    compress: { dead_code: true, unused: true, warnings: true },
    output: { comments: false },
    sourceMap: false
  }));
}

module.exports = {
  debug: true,
  devtool: nodeEnv === 'development' ? '#eval' : '@cheap-source-map',

  resolve: {
    extensions: ['', '.js', '.jsx'],
  },

  entry: entries,

  output: {
    path: path.resolve(__dirname, '../dist/js/'),
    publicPath: '/js/',
    filename: '[name].bundle.js'
  },

  plugins: plugins,

  module: {
    loaders: [
      {
        test: /\.js[x]?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          // es2015-loose and transform-proto-to-assign is a IE9-10
          // solution to change te use of unsuported Object.getPrototypeOf
          // http://bit.ly/1QvY9hW -> Babel compiler doesn't support IE
          presets: ['es2015-loose', 'stage-0', 'react'],
          plugins: [
            'transform-proto-to-assign'
          ],
          env: {
            development: {
              plugins: [['react-transform', {
                transforms: [{
                  transform: 'react-transform-hmr',
                  imports: ['react'],
                  locals: ['module'],
                }],
              }]],
            },
          },
        }
      }
    ]
  }
};
