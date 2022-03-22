const chartProperties = {
      width:1350,
      height:600,
      timeScale:{
        timeVisible:true,
        secondsVisible:true,
      },
      crosshair: {
        mode: LightweightCharts.CrosshairMode.Normal,
      },
    }

const domElement = document.getElementById('tvchart')
const chart = LightweightCharts.createChart(domElement,chartProperties)
const candleseries = chart.addCandlestickSeries()

chart.timeScale().scrollToPosition(-20, false);

var width = 27;
var height = 27;

var button = document.createElement('div');
button.className = 'go-to-realtime-button';
button.style.left = (chartProperties.width - width - 60) + 'px';
button.style.top = (chartProperties.height - height - 30) + 'px';
button.style.color = '#4c525e';
button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" width="14" height="14"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M6.5 1.5l5 5.5-5 5.5M3 4l2.5 3L3 10"></path></svg>';
document.body.appendChild(button);

var timeScale = chart.timeScale();
timeScale.subscribeVisibleTimeRangeChange(function() {
	var buttonVisible = timeScale.scrollPosition() < 0;
	button.style.display = buttonVisible ? 'block' : 'none';
});

button.addEventListener('click', function() {
	timeScale.scrollToRealTime();
});

button.addEventListener('mouseover', function() {
	button.style.background = 'rgba(250, 250, 250, 1)';
	button.style.color = '#000';
});

button.addEventListener('mouseout', function() {
	button.style.background = 'rgba(250, 250, 250, 0.6)';
	button.style.color = '#4c525e';
});

var volumeseries = chart.addHistogramSeries({
	color: '#26a69a',
	priceFormat: {
		type: 'volume',
	},
	priceScaleId: '',
	scaleMargins: {
		top: 0.8,
		bottom: 0,
	},
});

var legend = document.createElement('div');
legend.className = 'sma-legend';
//container.appendChild(legend);
legend.style.display = 'block';
legend.style.left = 3 + 'px';
legend.style.top = 3 + 'px';

function setLegendText(volumeValue) {
	let val = 'n/a';
	if (priceValue !== undefined) {
		val = Math.round(volumeValue);
	}
	legend.innerHTML = 'Volume <span style="color:rgba(4, 111, 232, 1)">' + val + '</span>';
}

const socket = io.connect('http://localhost:3000/')

socket.on('kline', (data) => {
  console.log(data)
  //candleseries.update(data.candle)
  //volumeseries.update(data.volume)
  //setLegendText(data.volume.value)
  // chart.subscribeCrosshairMove((param) => {
  //   setLegendText(param.seriesPrices.get(data.volume));
  // });
})