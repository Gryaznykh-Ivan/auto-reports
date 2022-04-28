const { baseKeyBoard } = require("../keyboards");

const getBotInfo = async ctx => {
    return await ctx.reply('Reporter bot v1.0.0.\nhttps://github.com/gryaznykh-ivan', baseKeyBoard);
}

module.exports = {
    getBotInfo
}