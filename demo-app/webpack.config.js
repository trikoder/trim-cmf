var webpack = require('webpack');
var path = require('path');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

require('dotenv').config();

module.exports = function(env) {

    var paths = {
        baseUrl: process.env.BASE_URL || '/demo-app/',
        baseApiUrl: process.env.BASE_API_URL || '/demo-app/api',
        src: './src/',
        dist: path.resolve(__dirname, 'dist') + '/',
        public: process.env.PUBLIC_URL || '/demo-app/dist/',
        nodeModules: 'node_modules',
        cmfSrc: '../src/',
        cmfNodeModules: '../node_modules'
    };

    var webpackConfig = {

        entry: {
            main: paths.src + 'js/main.js',
            login: paths.src + 'js/login.js'
        },

        output: {
            path: paths.dist,
            filename: 'js/[name].js',
            publicPath: paths.public
        },

        devServer: {
            contentBase: './dist'
        },

        module: {
            rules: [

                {
                    test: /\.js$/,
                    use: [
                        {loader: 'babel-loader'},
                        {loader: 'eslint-loader'}
                    ],
                    exclude: /node_modules/
                },

                {
                    test: /\.(jst)$/,
                    use: [
                        {loader: 'nunjucks-loader'}
                    ]
                },

                {
                    test: /\.scss$/,
                    exclude: /login\.scss/,
                    use: [
                        {loader: 'style-loader'},
                        {loader: 'css-loader'},
                        {loader: 'sass-loader', options: {
                            includePaths: [paths.nodeModules, paths.cmfNodeModules]
                        }}
                    ]
                },

                {
                    test: /login\.scss/,
                    use: ExtractTextPlugin.extract({
                        use: [
                            {loader: 'css-loader'},
                            {loader: 'sass-loader', options: {
                                includePaths: [paths.nodeModules, paths.cmfNodeModules]
                            }}
                        ]
                    })
                },

                {
                    test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
                    loader: 'url-loader',
                    options: {limit: 10000}
                },

                {
                    test: /\.css$/,
                    use: [
                        {loader: 'style-loader'},
                        {loader: 'css-loader'}
                    ]
                }

            ],
        },

        resolve: {
            modules: [
                paths.src,
                paths.cmfSrc,
                paths.nodeModules,
                paths.cmfNodeModules
            ],
            alias: {
                'api-server': path.resolve(__dirname, 'src/js/server/' + (env.mode === 'production' ? 'client.js' : 'nodePlaceholder.js')),
            }
        },

        stats : {
            assets : true,
            excludeAssets : [/.*ckeditor\/.*/]
        },

        plugins: [

            new webpack.DefinePlugin({
                'process.env': {
                    'NODE_ENV': JSON.stringify(env.mode),
                    'BASE_URL': JSON.stringify(paths.baseUrl),
                    'BASE_API_URL': JSON.stringify(paths.baseApiUrl),
                    'ASSET_PATH': JSON.stringify(paths.public)
                }
            }),

            new HtmlWebpackPlugin({
                title: 'Trikoder admin',
                template: 'src/templates/index.ejs',
                chunks: ['main']
            }),

            new HtmlWebpackPlugin({
                title: 'Trikoder admin',
                template: 'src/templates/index.ejs',
                filename: '../index.html',
                chunks: ['main']
            }),

            new HtmlWebpackPlugin({
                template: 'src/templates/login.ejs',
                filename: '../login.html',
                chunks: ['login']
            }),

            new CopyWebpackPlugin([{
                from: require('path').dirname(require.resolve('ckeditor')),
                to: paths.dist + 'ckeditor',
                ignore: ['*.php']
            }]),

            new ExtractTextPlugin('css/[name].css')

        ]

    };

    if (env.mode === 'production') {

        webpackConfig.plugins.push(new webpack.LoaderOptionsPlugin({
            minimize: true,
            debug: false
        }));

        webpackConfig.plugins.push(new webpack.optimize.UglifyJsPlugin({
            comments: false,
            mangle: {
                screw_ie8: true,
            },
            compress: {
                screw_ie8: true,
                warnings: false
            }
        }));

        webpackConfig.plugins.push(new webpack.optimize.ModuleConcatenationPlugin());

    }

    return webpackConfig;

};
