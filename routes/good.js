var express = require('express')
var mongoose = require('mongoose')
var Good = require('../models/good')
var DB_URL = 'mongodb://localhost:27017/pMall';

var router = express.Router()

mongoose.connect(DB_URL)

//连接成功
mongoose.connection.on('connected', () => {
  console.log('Mongoose connection open to ' + DB_URL);
});
// 连接异常
mongoose.connection.on('error', function (err) {
  console.log('Mongoose connection error: ' + err);
});
// 连接断开
mongoose.connection.on('disconnected', function () {
  console.log('Mongoose connection disconnected');
});

router.get('/', function (req, res, next) {
  let page = parseInt(req.param('page'))
  let pageSize = parseInt(req.param('pageSize'))
  let sort = req.param('sort')
  let type = parseInt(req.param('type'))
  let skip = (page - 1) * pageSize
  let params = {}
  if (type && type < 3) {
    params.type = type
  }
  let totalCount = 0
  Good.count(params, (err, count) => {
    if (err) {
      console.log(err)
    } else {
      totalCount = count
    }
  })
  let goodModel = Good.find(params).skip(skip).limit(pageSize)

  if (sort === -1 || sort === 1) {
    goodModel.sort({'pPrice': sort})
  }
  goodModel.exec((err, doc) => {
    if (err) {
      res.json({
        status: 1,
        msg: err.msg
      })
    } else {
      res.json({
        status: 0,
        msg: '',
        result: {
          totalCount: totalCount,
          count: doc.length,
          list: doc
        }
      })
    }
  })
})

router.get('/detail', function (req, res, next) {
  let params = {
    pid: parseInt(req.param('productId'))
  }

  Good.find(params, (err, doc) => {
    if (err) {
      res.json({
        status: 1,
        msg: err.msg
      })
    } else {
      res.json({
        status: 0,
        msg: '',
        result: {
          list: doc
        }
      })
    }
  })
})

module.exports = router
