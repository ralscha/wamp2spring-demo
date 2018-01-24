function getChartOption(name, threshold) {
	return {
		series: [ {
			startAngle: 180,
			endAngle: 0,
			center: [ '50%', '90%' ],
			radius: 100,
			min: 0,
			max: 30,
			name: 'Serie',
			type: 'gauge',
			splitNumber: 3,
			data: [ {
				value: 16,
				name: name
			} ],
			title: {
				show: true,
				offsetCenter: [ '-100%', '-90%' ],
				textStyle: {
					color: '#333',
					fontSize: 15
				}
			},
			axisLine: {
				lineStyle: {
					color: [ [ threshold, '#ff4500' ], [ 1, 'lightgreen' ] ],
					width: 8
				}
			},
			axisTick: {
				length: 11,
				lineStyle: {
					color: 'auto'
				}
			},
			splitLine: {
				length: 15,
				lineStyle: {
					color: 'auto'
				}
			},
			detail: {
				show: true,
				offsetCenter: [ '100%', '-100%' ],
				textStyle: {
					color: 'auto',
					fontSize: 25
				}
			}

		} ]

	};
}

const names = ['s1', 's2', 's3', 's4', 's5'];
const threshold = [0.1, 0.2, 0.7, 0.5, 0.9];
const gauges = [];

for (let i = 0; i < names.length; i++) {
	const chart = echarts.init(document.getElementById('chart'+(i+1)));
	chart.setOption(getChartOption(names[i], threshold[i]));
	gauges.push(chart);
}


const serverPathUrl = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
const wsURL = (window.location.protocol == "https:" ? "wss://" : "ws://") + window.location.host + serverPathUrl + "wamp";

const connection = new autobahn.Connection({
	url: wsURL
});

connection.onopen = function(session, details) {
	session.subscribe('data', handleResponse);
};

connection.open();

function handleResponse(args) {
	for (let i = 0; i < 5; i++) {
		gauges[i].setOption({
			series: {
				data: [ {
					name: names[i],
					value: args[i]
				} ]
			}
		});
	}
}
