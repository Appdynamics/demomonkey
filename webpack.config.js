/*
 TODO: Check if "autocomplete still works"
 TODO: Create build-dev / build-prod scripts etc.
*/
const fs = require('fs')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const GitRevisionPlugin = require('git-revision-webpack-plugin')
const ZipPlugin = require('zip-webpack-plugin')
const ExtensionReloader = require('webpack-extension-reloader')

const manifest = JSON.parse(fs.readFileSync('./manifest.json'))

const clientIds = {
  stable: '534261080696-0kbmc92ddf5mmqm1qqubs8qepvj23tc1.apps.googleusercontent.com',
  'dev-channel': '534261080696-0kbmc92ddf5mmqm1qqubs8qepvj23tc1.apps.googleusercontent.com'
}

module.exports = env => {
  let outputDirectory = 'build'
  let isRelease = false
  let releaseSuffix = 'stable'
  if (env.RELEASE) {
    outputDirectory = 'build-release'
    isRelease = true
    releaseSuffix = env.RELEASE
  }

  const plugins = [
    new HtmlWebpackPlugin({
      chunks: ['app'],
      title: 'Demo Monkey Dashboard',
      template: 'pages/template.html',
      filename: 'options.html',
      appname: 'OptionsPageApp',
      inject: 'head',
      htmlClass: ''
    }),
    new HtmlWebpackPlugin({
      chunks: ['app'],
      title: 'Demo Monkey Popup',
      template: 'pages/template.html',
      filename: 'popup.html',
      appname: 'PopupPageApp',
      inject: 'head',
      htmlClass: 'popup-app'
    }),
    new HtmlWebpackPlugin({
      chunks: ['app'],
      title: 'Demo Monkey Toolbar',
      template: 'pages/template.html',
      filename: 'devtools.html',
      inject: 'head',
      appname: 'DevToolsPageApp',
      htmlClass: ''
    }),
    new HtmlWebpackPlugin({
      chunks: ['background'],
      title: 'Demo Monkey Background',
      template: 'pages/template.html',
      filename: 'background.html',
      inject: 'head',
      appname: '',
      htmlClass: '',
      background: true
    }),
    new CopyPlugin({
      patterns: [
        {
          from: 'manifest.json',
          to: '.',
          transform: content => {
            if (releaseSuffix === 'dev-channel') {
              return Buffer.from(content.toString()
                .replace(/"name": "([^"]*)"/g, '"name": "$1 (dev-channel)"')
                .replace(/"(default_icon|16|48|128)": "([^_]*)([^"]*)"/g, '"$1": "$2-dev$3"')
                .replace(/"client_id": "([^"]*)"/g, '"client_id": "' + clientIds['dev-channel'] + '"')
              )
            } else if (releaseSuffix === 'stable') {
              return Buffer.from(content.toString()
                .replace(/"client_id": "([^"]*)"/g, '"client_id": "' + clientIds.stable + '"')
              )
            }
            return content
          }
        },
        { from: 'README.md', to: '.' },
        { from: 'USAGE.md', to: '.' },
        { from: 'LICENSE', to: '.' },
        { from: 'src/test.js', to: '.' },
        { from: 'src/gapi.js', to: 'js' },
        { from: 'pages/test.html', to: '.' },
        { from: 'src/backup.js', to: '.' },
        { from: 'pages/backup.html', to: '.' }
      ]
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name].css'
    }),
    new GitRevisionPlugin()
  ]

  if (isRelease) {
    plugins.push(new ZipPlugin({
      filename: `DemoMonkey-${manifest.version}-${releaseSuffix}.zip`,
      path: '..'
    }))
  } else {
    plugins.push(new ExtensionReloader({
      reloadPage: true, // Force the reload of the page also
      entries: { // The entries used for the content/background scripts or extension pages
        contentScript: 'monkey',
        background: 'background',
        extensionPage: 'app'
      }
    }))
  }

  return {
    entry: {
      app: './src/app.js',
      background: './src/background.js',
      monkey: './src/monkey.js',
      inline: './src/inline.js'
    },
    output: {
      filename: 'js/[name].js',
      path: path.resolve(__dirname, outputDirectory)
    },
    plugins,
    module: {
      rules: [
        {
          test: /\.(jpe?g|png|webp)$/i,
          use: {
            loader: 'responsive-loader',
            options: {
              sizes: [16, 48, 128],
              outputPath: 'icons/',
              name: '[name]_[width].[ext]'
            }
          }
        },
        {
          test: /\.m?js$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
              plugins: ['@babel/plugin-proposal-object-rest-spread']
            }
          }
        },
        {
          test: /\.less$/i,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            'less-loader'
          ]
        },
        {
          test: /\.md$/,
          use: [
            {
              loader: 'raw-loader',
              options: {
                esModule: false
              }
            }
          ]
        },
        {
          test: /\.mnky$/,
          use: [
            {
              loader: 'raw-loader',
              options: {
                esModule: false
              }
            }
          ]
        }
      ]
    }
  }
}
