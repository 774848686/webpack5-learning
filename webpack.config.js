const path = require('path');
const tapable = require('./src/Tapable');
const RmFilePlugin = require('./plugins/RmFilePlugin');
const DelNotePlugin = require('./plugins/DelNotePlugin');
// HtmlWebpackPlugin帮助你创建html文件，并自动引入打包输出的bundles文件。支持html压缩。
const HtmlWebpackPlugin = require("html-webpack-plugin");
// 该插件将CSS提取到单独的文件中。它会为每个chunk创造一个css文件。需配合loader一起使用
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

// 该插件将在Webpack构建过程中搜索CSS资源，并优化\最小化CSS
const OptimizeCssAssetsWebpackPlugin = require("optimize-css-assets-webpack-plugin");
module.exports = {
    mode: 'none',
    entry: './src/index.js',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true, // 打包前清空输出目录，相当于clean-webpack-plugin插件的作用。
        /* 当用 Webpack 去构建一个可以被其他模块导入使用的库时需要用到library */
        library: {
            name: "[name]", //整个库向外暴露的变量名
            type: "window" //库暴露的方式
        }
    },
    /* 解析loader的规则 */
    resolveLoader: {
        // loader查找路径，默认是node_modules,所以我们平常写loader（如babel-loader）时实际都会去node_modules里找
        modules: ["node_modules", path.resolve(__dirname, "loaders")], // 增加查找路径。顺序是从前往后
    },
    devServer: {
        // 为每个静态文件开启gzip压缩
        compress: true,
        host: "localhost",
        port: 5000,
        open: true, // 自动打开浏览器
        hot: true, //开启HMR功能
    },
    module: {
        rules: [{
                // 匹配哪些文件
                test: /\.css$/,
                // 使用哪些loader进行处理。执行顺序，从右至左，从下至上
                use: [
                    // 创建style标签，将js中的样式资源（就是css-loader转化成的字符串）拿过来，添加到页面head标签生效
                    "style-loader",
                    // 将css文件变成commonjs一个模块加载到js中，里面的内容是样式字符串
                    "css-loader",
                    {

                        // css 兼容处理 postcss，注意需要在package.json配置browserslist
                        loader: "postcss-loader",
                        options: {
                            postcssOptions: {
                                ident: "postcss",
                                // postcss-preset-env插件：帮postcss找到package.json中的browserslist配置，根据配置加载指定的兼容性样式      
                                plugins: [require("postcss-preset-env")()]
                            },
                        },
                    },
                ],
            },
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                // 注意需要在package.json配置browserslist，否则babel-loader不生效
                use: [ {
                    // 因为配置了resolveLoader，在loaders文件夹下找到了del-note-loader
                    loader: "del-note-loader",
                    options: {
                        oneLine: true, // 是否删除单行注释
                        multiline: true, // 是否删除多行注释
                    }
                }, {
                    // js兼容处理 babel
                    loader: "babel-loader", // 规则只使用一个loader时推荐写法
                    options: {
                        presets: [
                            [
                                "@babel/preset-env", // 预设：指示babel做怎么样的兼容处理 
                                {
                                    useBuiltIns: "usage", //按需加载
                                    corejs: {
                                        version: "3",
                                    },
                                    targets: "defaults",
                                }
                            ]
                        ],
                        plugins: ['@babel/plugin-transform-runtime']
                    }
                }]
            },
            /* 
            Webpack5.0新增资源模块(asset module)，它是一种模块类型，允许使用资源文件（字体，图标等）而无需     配置额外 loader。支持以下四个配置
            asset/resource 发送一个单独的文件并导出 URL。之前通过使用 file-loader 实现。
            asset/inline 导出一个资源的 data URI。之前通过使用 url-loader 实现。
            asset/source 导出资源的源代码。之前通过使用 raw-loader 实现。
            asset 在导出一个 data URI 和发送一个单独的文件之间自动选择。之前通过使用 url-loader，并且配置资     源体积限制实现。
            */
            // Webpack4使用file-loader实现
            {
                test: /\.(eot|svg|ttf|woff|)$/,
                type: "asset/resource",
                generator: {
                    // 输出文件位置以及文件名
                    filename: "fonts/[name][ext]"
                },
            },
            // Webpack4使用url-loader实现
            {
                //处理图片资源
                test: /\.(jpg|png|gif|)$/,
                type: "asset",
                generator: {
                    // 输出文件位置以及文件名
                    filename: "images/[name][ext]"
                },
                parser: {
                    dataUrlCondition: {
                        maxSize: 10 * 1024 //超过10kb不转base64
                    }
                }
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "index.html"
        }),
        new MiniCssExtractPlugin({
            filename: "css/built.css",
        }),
        new OptimizeCssAssetsWebpackPlugin(),
        new RmFilePlugin(),
        new DelNotePlugin() // 比del-note-loader 删除的更加彻底；
    ]

}