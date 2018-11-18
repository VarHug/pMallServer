var express = require('express')
var mongoose = require('mongoose')
var User = require('../models/user')
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
  let uid = req.param('uid')
  let pwd = req.param('pwd')
  let params = {
    uid,
    pwd
  }
  User.findOne(params, (err, doc) => {
    if (err) {
      res.json({
        status: 1,
        msg: err.msg
      })
    } else {
      // 帐号或密码正确有返回结果
      if (doc) {
        res.json({
          status: 0,
          msg: '',
          result: {
            uid: doc.uid,
            name: doc.name,
            avatar: doc.avatar
          }
        })
      } else { // 帐号或密码错误无返回结果
        res.json({
          status: 1,
          msg: 'not find',
          result: {}
        })
      }
    }
  })
})

router.get('/getCartList', function (req, res, next) {
  let params = req.query
  let uid = params.uid
  let whereStr = {
    uid
  }
  getCartList(whereStr, res)
})

router.get('/setCartList', function (req, res, next) {
  // 获取参数
  let params = req.query
  let uid = params.uid
  let goodInfo = JSON.parse(params.goodInfo)
  // 获取购物车
  let whereStr = {
    uid
  }
  User.findOne(whereStr, (err, doc) => {
    if (err) {
      res.json({
        status: 1,
        msg: err.msg
      })
    } else {
      let cartList = doc.cartList || []
      // 设置购物车
      let flag = false
      cartList.forEach(good => {
        if (good.pid === goodInfo.pid) {
          good.num += goodInfo.num
          flag = true
        }
      })
      if (!flag) {
        cartList.push(goodInfo)
      }
      let updateStr = {
        cartList
      }
      // 更新购物车
      User.updateOne(whereStr, updateStr, (err, doc) => {
        if (err) {
          res.json({
            status: 1,
            msg: err.msg
          })
        } else {
          getCartList(whereStr, res)
        }
      })
    }
  })
})

router.get('/setCheckedState', function (req, res, next) {
  // 获取参数
  let params = req.query
  let uid = params.uid
  let states = JSON.parse(params.states)
  // 获取购物车
  let whereStr = {
    uid
  }
  User.findOne(whereStr, (err, doc) => {
    if (err) {
      res.json({
        status: 1,
        msg: err.msg
      })
    } else {
      let cartList = doc.cartList || []
      // 设置购物车
      states.forEach(state => {
        for (let i = 0; i < cartList.length; i++) {
          if (state.pid === cartList[i].pid) {
            cartList[i].isChecked = state.isChecked
          }
        }
      })
      let updateStr = {
        cartList
      }
      // 更新购物车
      User.updateOne(whereStr, updateStr, (err, doc) => {
        if (err) {
          res.json({
            status: 1,
            msg: err.msg
          })
        } else {
          getCartList(whereStr, res)
        }
      })
    }
  })
})

router.get('/concatCartList', function (req, res, next) {
  // 获取参数
  let params = req.query
  let uid = params.uid
  let goodsList = JSON.parse(params.goodsList)
  // 获取购物车
  let whereStr = {
    uid
  }
  User.findOne(whereStr, (err, doc) => {
    if (err) {
      res.json({
        status: 1,
        msg: err.msg
      })
    } else {
      let cartList = doc.cartList || []
      let len = cartList.length;
      // 设置购物车
      goodsList.forEach(listitem => {
        let flag = false
        for (let i = 0; i < len; i++) {
          if (listitem.pid === cartList[i].pid) {
            cartList[i].num += listitem.num
            flag = true
          }
        }
        if (!flag) {
          cartList.push(listitem)
        }
      })
      let updateStr = {
        cartList
      }
      // 更新购物车
      User.updateOne(whereStr, updateStr, (err, doc) => {
        if (err) {
          res.json({
            status: 1,
            msg: err.msg
          })
        } else {
          getCartList(whereStr, res)
        }
      })
    }
  })
})

router.get('/removeCartList', function (req, res, next) {
  // 获取参数
  let params = req.query
  let uid = params.uid
  let productId = parseInt(params.productId)
  // 获取购物车
  let whereStr = {
    uid
  }
  User.findOne(whereStr, (err, doc) => {
    if (err) {
      res.json({
        status: 1,
        msg: err.msg
      })
    } else {
      let cartList = doc.cartList || []
      // 设置购物车
      let index = cartList.findIndex((good) => {
        return good.pid === productId
      })
      if (index > -1) {
        cartList.splice(index, 1)
      }
      let updateStr = {
        cartList
      }
      // 更新购物车
      User.updateOne(whereStr, updateStr, (err, doc) => {
        if (err) {
          res.json({
            status: 1,
            msg: err.msg
          })
        } else {
          getCartList(whereStr, res)
        }
      })
    }
  })
})

// 删除选中的全部商品
router.get('/deleteCheckedGoods', function (req, res, next) {
  // 获取参数
  let params = req.query
  let uid = params.uid
  let goodsList = JSON.parse(params.goodsList)
  // 获取购物车
  let whereStr = {
    uid
  }
  User.findOne(whereStr, (err, doc) => {
    if (err) {
      res.json({
        status: 1,
        msg: err.msg
      })
    } else {
      let cartList = doc.cartList || []
      // 设置购物车
      goodsList.forEach(pid => {
        for(let i = 0; i < cartList.length; i++) {
          if (pid === cartList[i].pid) {
            cartList.splice(i, 1)
          }
        }
      })
      let updateStr = {
        cartList
      }
      // 更新购物车
      User.updateOne(whereStr, updateStr, (err, doc) => {
        if (err) {
          res.json({
            status: 1,
            msg: err.msg
          })
        } else {
          getCartList(whereStr, res)
        }
      })
    }
  })
})

router.get('/updateConsignee', function (req, res, next) {
  // 获取参数
  let params = req.query
  let uid = params.uid
  let consignee = JSON.parse(params.consigneeList)
  let whereStr = {
    uid
  }
  let updateStr = {
    consignee
  }
  User.updateOne(whereStr, updateStr, (err, doc) => {
    if (err) {
      res.json({
        status: 1,
        msg: err.msg
      })
    } else {
      res.json({
        status: 0,
        msg: 'update success'
      })
    }
  })
})

router.get('/getConsignee', function (req, res, next) {
  let params = req.query
  let uid = params.uid
  let whereStr = {
    uid
  }
  User.findOne(whereStr, (err, doc) => {
    if (err) {
      res.json({
        status: 1,
        msg: err.msg
      })
    } else {
      if (doc) {
        res.json({
          status: 0,
          msg: '',
          result: {
            consignee: doc.consignee || []
          }
        })
      } else {
        res.json({
          status: 1,
          msg: 'not find',
          result: {}
        })
      }
    }
  })
})

function getCartList(whereStr, res) {
  User.findOne(whereStr, (err, doc) => {
    if (err) {
      res.json({
        status: 1,
        msg: err.msg
      })
    } else {
      if (doc) {
        res.json({
          status: 0,
          msg: '',
          result: {
            cartList: doc.cartList
          }
        })
      } else {
        res.json({
          status: 1,
          msg: 'not find',
          result: {}
        })
      }
    }
  })
}

module.exports = router
