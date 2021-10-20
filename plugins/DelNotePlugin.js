// DelNotePlugin.js

const { sources } = require('webpack');

class DelNotePlugin {
    constructor(options) {
        this.options = options
    }

    apply(compiler) {
        // compilation 创建之后执行注册事件
        compiler.hooks.compilation.tap("DelNotePlugin", (compilation) => {
            // 处理asset
            compilation.hooks.processAssets.tap(
                {
                    name: 'DelNotePlugin', //插件名称
                    //要对asset做哪种类型的处理，这里的填值代表的是对asset 进行了基础预处理
                    stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_PRE_PROCESS,
                },
                (assets) => {
                    for (const name in assets) {
                        // 只对js资产做处理
                        if (name.endsWith(".js")) {
                            if (Object.hasOwnProperty.call(assets, name)) {
                                const asset = compilation.getAsset(name); // 通过asset名称获取到asset
                                const contents = asset.source.source(); // 获取到asset的内容
                                const result = contents.replace(/\/\/.*/g, "").replace(/\/\*.*?\*\//g, "");//删除注释
                                // 更新asset的内容
                                compilation.updateAsset(
                                    name,
                                    new sources.RawSource(result)
                                );
                            }
                        }
                    }
                }
            );
        })
    }
}
module.exports = DelNotePlugin
