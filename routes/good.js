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
  let params = req.query
  let page = parseInt(params.page)
  let pageSize = parseInt(params.pageSize)
  let skip = (page - 1) * pageSize
  let whereStr = {}
  // 查询种类设置（手机产品、周边产品）
  let type = parseInt(params.type)
  if (type && type < 3) {
    whereStr.type = type
  }

  // 模糊查询queryString
  let queryString = params.queryString
  if (queryString) {
    whereStr.pName = new RegExp(queryString)
  }

  let totalCount = 0
  Good.count(whereStr, (err, count) => {
    if (err) {
      console.log(err)
    } else {
      totalCount = count
    }
  })
  let goodModel = Good.find(whereStr).skip(skip).limit(pageSize)

  // 排序相关
  let sort = parseInt(params.sort)
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
