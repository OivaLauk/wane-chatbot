import path from 'path';
import { fileURLToPath } from 'url';
import CopyWebpackPlugin from 'copy-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  entry: './src/main.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: './src/index.html', to: './' },
        { from: './src/lightmode.css', to: './' },
        { from: './src/darkmode.css', to: './' },
        { from: './src/assets', to: './assets' },
        { from: './src/API.js', to: './API.js' },
        { from: './src/personalities/defaultPersonalities.js', to: './personalities/defaultPersonalities.js' },
        { from: './src/clean-build.js', to: './init.js' }
      ]
    })
  ],
  resolve: {
    extensions: ['.js'],
    fallback: {
      "path": false,
      "fs": false,
      "os": false,
      "util": false
    }
  },
  experiments: {
    outputModule: true,
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'src'),
      publicPath: '/',
      watch: true,
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/javascript',
    },
  }
};