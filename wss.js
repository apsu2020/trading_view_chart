// input in seconds

// ####################################################################
const seconds = 86400
// ####################################################################

// web socket code

const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const { registerRuntimeCompiler } = require("@vue/runtime-core")
const { parse } = require("path")

const fs = require("fs")
const path = require('path')
const csv = require('fast-csv')

const app = express()

// Middleware
app.use(morgan('tiny'))
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// app.use(function(req, res, next) {
//   res.header('Access-Control-Allow-Origin', "*");
//   res.header('Access-Control-Allow-Methods','GET,PUT,POST,DELETE');
//   res.header('Access-Control-Allow-Headers', 'Content-Type');
//   next();
// })

let klines; let output = []; let Startime; let Endtime;

function minMax2DArray(arr, idx) {
  var max = -Number.MAX_VALUE,
      min = Number.MAX_VALUE;
  arr.forEach(function(e) {
      if (max < e[idx]) {
          max = e[idx];
      }
      if (min > e[idx]) {
         min = e[idx];
     }
  });
  return {max: max, min: min};
}

const getData = async () => {
    fs.createReadStream("./data/BTCUSDT-trades-2022-02.csv")
      .pipe(csv.parse({ headers: ['id', 'price', 'amount', 'qtAmount', 'time', 'maker'] }))
      .on('error', error => console.error(error))
      .on('data', row => {
        if (row.time >= Startime && row.time < Endtime) {
          output.push(row)
          // let df = output.map(i => [parseInt(i.time), parseFloat(i.price), parseFloat(i.amount), i.maker])
          // klines = {
          //   time  : Math.round(df[0][0]/1000),
          //   open  : df[0][1],
          //   high  : Math.max(...df.map(i => i[1])),
          //   low   : Math.min(...df.map(i => i[1])),
          //   close : df[df.length - 1][1],
          //   volume: df.map(i => i[2]).reduce((a,b) => a + b)
          // }
          // io.sockets.emit('kline',klines)
        } else {
          Startime = new Date(parseInt(row.time)).setMilliseconds(0)
          Endtime = new Date(Startime).setSeconds(
            new Date(parseInt(Startime)).getSeconds() + seconds
          )
          console.log(Startime,Endtime)
          if (output.length != 0) {
            let df = output.map(i => [parseInt(i.time), parseFloat(i.price), parseFloat(i.amount), i.maker])
            let range = minMax2DArray(df,1)
            klines = {
              candle : {
                time  : parseInt(df[0][0]/1000),
                open  : df[0][1],
                high  : range.max,
                low   : range.min,
                close : df[df.length - 1][1],
              },
              volume : {
                time  : parseInt(df[0][0]/1000),
                value : Math.round(df.map(i => i[2]).reduce((a,b) => a + b)),
                color : df[0][1] < df[df.length - 1][1] ? 'rgba(0, 150, 136, 0.8)' : 'rgba(255,82,82, 0.8)' 
              }
            }
            io.sockets.emit('kline',klines)
            output = []
            output.push(row)
          } else {
            output.push(row)
          }
        }
      })
      .on('end', rowCount => console.log(`Parsed ${rowCount} rows`))
}


app.use(express.static(path.join(__dirname, 'public')))

app.set('puerto', process.env.PORT || 3000)
var server = app.listen(app.get('puerto'), function () {
console.log('App listening on port: '+ app.get('puerto'))
})

const io = require('socket.io')(server, {
  cors: {
    origin: '*',
  }
});

getData()