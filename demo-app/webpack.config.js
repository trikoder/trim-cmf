const webpack = require('webpack');
const { resolve } = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = function(env) {

    const path = {

        src: './src/',
        dist: resolve(__dirname, 'dist') + '/',
        public: '/demo-app/dist/',
        packageNodeModules: resolve(__dirname, '../node_modules/')

    };

    const webpackConfig = {

        entry: {

            main: path.src + 'js/main.js'

        },

        output: {

            path: path.dist,
            filename: 'js/[name].js',
            publicPath: path.public

        },

        module: {

            rules: [

                {
                    test: /\.js$/,
                    use: [
                        'babel-loader',
                        'eslint-loader'
                    ],
                    exclude: /node_modules/
                },

                {
                    test: /\.(jst|nunj|nunjucks)$/,
                    use: [
                        {loader: 'nunjucks-loader'}
                    ]
                },

                {
                    test: /\.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
                    loader: 'file-loader?name=fonts/[name].[ext]'
                },

                {
                    test: /\.scss$/,
                    use: ExtractTextPlugin.extract({
                        fallback: 'style-loader',
                        use: [{
                            loader: "css-loader"
                        }, {
                            loader: "sass-loader",
                            options: {
                                includePaths: [path.packageNodeModules]
                            }
                        }]
                    })
                },

                {
                    test: /\.css$/,
                    use: [ 'style-loader', 'css-loader', ],
                }

            ],

        },

        resolve: {

            modules: [
                path.src,
                path.packageNodeModules,
            ]

        },

        plugins: [

            new ExtractTextPlugin('css/[name].css'),

            new CopyWebpackPlugin([{from: path.packageNodeModules + '/ckeditor', to: path.dist + '/ckeditor'}])

        ]

    };

    if (env.mode === 'production') {

        webpackConfig.plugins.push(new webpack.LoaderOptionsPlugin({
            minimize: true,
            debug: false
        }));

        webpackConfig.plugins.push(new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
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

    }

    return webpackConfig;

};
