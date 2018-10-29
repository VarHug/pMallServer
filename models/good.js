var mongoose = require('mongoose')
var Schema = mongoose.Schema

var GoodSchema = new Schema({
  'pid': Number,
  'type': Number,
  'pName': String,
  'pTitle': String,
  'pPrice': Number,
  'category': Array,
  'preview': Array,
  'detail': Array,
  'seller': String
})

module.exports = mongoose.model('Good', GoodSchema, 'goods')
