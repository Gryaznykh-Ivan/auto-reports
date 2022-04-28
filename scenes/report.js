const redis = require("../db");
const fs = require('fs');
const { baseKeyBoard } = require('../keyboards');
const { Scenes } = require('telegraf')
const imageDataURI = require('image-data-uri');
const { getDataFromRedis, createReport } = require('../utils/report-maker');
const { getHorizontalBarChart } = require('../utils/chart-maker');

const getReportInfo = new Scenes.WizardScene(
    'GET_REPORT_INFO',
    async ctx => {
        ctx.reply('✅ Enter user id ✅');
        ctx.wizard.state.data = {};
        return ctx.wizard.next();
    },
    async ctx => {
        const check = await redis.exists(`stats_data:${ctx.message.text}`);
        if (check === 0) {
            ctx.reply('User does not exist');
            return;
        }

        ctx.wizard.state.data.id = ctx.message.text;
        ctx.reply('✅ Enter time period ✅\n Examples: 1d, 7d, 30d');
        return ctx.wizard.next();
    },
    async ctx => {
        if (ctx.message.text.at(-1) !== "d" && isNaN(+ctx.message.text.slice(0, -1)) === false) {
            ctx.reply('Please enter according to the examples');
            return;
        }

        ctx.wizard.state.data.restrictiveTime = (+ctx.message.text.slice(0, -1));
        ctx.reply('✅ Enter fullname ✅');
        return ctx.wizard.next();
    },
    async ctx => {
        if (ctx.message.text.length < 2) {
            ctx.reply('Please enter fullname for real');
            return;
        }

        ctx.wizard.state.data.fullname = ctx.message.text;
        ctx.reply('✅ Enter profession ✅');
        return ctx.wizard.next();
    },
    async ctx => {
        if (ctx.message.text.length < 2) {
            ctx.reply('Please enter profession for real');
            return;
        }

        ctx.wizard.state.data.profession = ctx.message.text;
        ctx.reply('✅ Send photo ✅');
        return ctx.wizard.next();
    },
    async ctx => {
        const msg = ctx.update.message;
        if (msg.photo === undefined) {
            ctx.reply('Please send photo for real');
            return;
        }

        ctx.reply('❗️ Preparing a report ❗️');

        const photoUrl = await ctx.telegram.getFileLink(msg.photo[2].file_id);
        const photo = await imageDataURI.encodeFromURL(photoUrl);

        const restrictiveTime = Math.floor(Date.now() / 1000) - 86400 * ctx.wizard.state.data.restrictiveTime;
        const data = await getDataFromRedis(ctx.wizard.state.data.id, restrictiveTime)

        const chart = await getHorizontalBarChart(data);
        const pdf = await createReport({
            fullname: ctx.wizard.state.data.fullname,
            profession: ctx.wizard.state.data.profession,
            report: chart,
            photo,
        });

        await ctx.telegram.sendDocument(ctx.from.id, {
            source: pdf,
            filename: 'report.pdf'
        })

        await ctx.reply('Report sent successfully', baseKeyBoard);
        return ctx.scene.leave();
    },
);

module.exports = getReportInfo;