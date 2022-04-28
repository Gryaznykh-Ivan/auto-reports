const redis = require("../db");
const fs = require('fs');
const path = require('path');
const pdf = require('html-pdf');

const getDataFromRedis = async (userId, restrictiveTime) => {
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

    if (first === null || last === null) {
        return [0, 0, 0]
    }

    const sent = first.sent - last.sent;
    const connected = first.connected - last.connected;
    const replied = first.replied - last.replied;

    return [
        sent, connected, replied
    ]
}

const getHtmlReport = ({ fullname, profession, photo, report }) => {
    let html = fs.readFileSync(path.join(__dirname , '../template/report.html'), 'utf8');

    html = html.replace('insert:photo', photo);
    html = html.replace('insert:fillname', fullname);
    html = html.replace('insert:profession', profession);
    html = html.replace('insert:report', report);

    return html;
}

const createReport = (data) => {
    return new Promise((resolve, reject) => {
        const html = getHtmlReport(data);

        pdf.create(html).toStream((err, stream) => {
            if (err) return reject();

            resolve(stream);
        });
    });
}


module.exports = {
    createReport,
    getDataFromRedis
}