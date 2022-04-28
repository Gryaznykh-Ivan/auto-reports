
const createReport = async ctx => {
    return ctx.scene.enter('GET_REPORT_INFO'); // GET_REPORT_INFO
}

module.exports = {
    createReport
}