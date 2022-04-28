const baseKeyBoard = {
    "reply_markup": {
        "inline_keyboard": [
            [{ text: "Создать отчет", callback_data: "createReport" }],
            [{ text: "Информация о боте", callback_data: "getBotInfo" }]
        ],
    }
};

module.exports = {
    baseKeyBoard
}