require('dotenv').config();
const { Telegraf, Scenes, session } = require('telegraf')
const scenes = require('./scenes');
const controllers = require('./controllers');
const { baseKeyBoard } = require('./keyboards');

const start = async () => {
    const bot = new Telegraf(process.env.TELEGRAM_TOKEN)

    const stage = new Scenes.Stage([ ...scenes ]);
    bot.use(session())
    bot.use(stage.middleware())

    bot.start(async ctx => await ctx.reply('Welcome!\nReporter bot v1.0.0.', baseKeyBoard));

    bot.on('callback_query', async (ctx) => {
        const query = ctx.update.callback_query;
        const action = query.data;
        const sender = query.from.id;
        const chat_id = query.message?.chat.id || sender;

        if (JSON.parse(process.env.ADMINS).includes(sender) === false) {
            return await ctx.reply(chat_id, "You don`t have rights to use it");
        }

        if (action === undefined || Object.keys(controllers).includes(action) === false) {
            return await ctx.reply(chat_id, "Error. Non-existent action");
        }

        return await Object.values(controllers)[Object.keys(controllers).indexOf(action)](ctx);
    });

    bot.launch()
}

start();