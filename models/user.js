var mongoose = require('mongoose')
var Schema = mongoose.Schema

var UserSchema = new Schema({
  'uid': String,
  'pwd': String,
  'name': String,
  'avatar': String,
  'cartList': Array
})

module.exports = mongoose.model('User', UserSchema, 'users')