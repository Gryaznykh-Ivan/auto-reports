const redis = require("./db");
const fs = require('fs');

const { getHorizontalBarChart } = require('./utils/chart-maker');
const { createReport } = require('./utils/report-maker');

const start = async () => {
    const userId = 5851517;
    const restrictiveTime = 1649939615;
    const fullname = 'Иван Иванович';
    const profession = 'SEO, OOO Фирма';
    const photo = '';


    // Берем данные из редис
    const timestamps = await redis.hkeys(`stats_data:${userId}`);
    const filtered = timestamps.filter(a => a >= restrictiveTime);
    const sorted = filtered.sort((a, b) => b - a);
    let first = null;
    let last = null;

    for (const timestamp of sorted) {
        const data = await redis.hget(`stats_data:${userId}`, timestamp);
        if (data === '') continue;

        first = JSON.parse(data);
        break;
    }

    for (const timestamp of sorted.reverse()) {
        const data = await redis.hget(`stats_data:${userId}`, timestamp);
        if (data === '') continue;

        last = JSON.parse(data);
        break;
    }

    const sent = first.sent - last.sent;
    const connected = first.connected - last.connected;
    const replied = first.replied - last.replied;

    // Создаем chart
    const report = await getHorizontalBarChart([sent, connected, replied]);

    // Создаем pdf
    const stream = await createReport({ photo, fullname, profession, report });
    stream.pipe(fs.createWriteStream('./test.pdf'));
}

start();