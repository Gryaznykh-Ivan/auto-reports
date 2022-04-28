const QuickChart = require('quickchart-js');

const getHorizontalBarChart = async (data) => {
    const qc = new QuickChart();

    qc.setConfig({
        type: 'horizontalBar',
        data: {
            labels: [`Sent: ${ data[0] }`, `Connected: ${ data[1] } (${ ((data[1] / data[0]) * 100).toFixed(2) }%)`, `Conversations: ${ data[2] } (${ ((data[2] / data[1]) * 100).toFixed(2) }%)`],
            datasets: [{
                data,
                borderColor: "#00A2FF",
                backgroundColor: "#00A2FF"
            }],
        },
        options: {
            legend: {
                display: false
            }
        }
    });

    qc.setWidth(600).setHeight(350).setBackgroundColor('transparent');

    return await qc.toDataUrl();
}

module.exports = {
    getHorizontalBarChart
}
