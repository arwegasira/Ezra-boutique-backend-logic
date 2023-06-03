const mongoose = require('mongoose')
const Schema = mongoose.Schema
const roomSchema = new Schema({
  name: {
    type: String,
    require: [true, 'Room Name is required'],
    unique: true,
  },
  roomType: {
    type: String,
    require: [true, 'Room Type is required'],
  },
  price: {
    type: Number,
    require: [true, 'Price is required'],
  },
  status: {
    type: String,
    default: 'Available',
  },
  accupationStart: {
    type: Date,
  },
  accupationEnd: {
    type: Date,
  },
})

module.exports = mongoose.model('Room', roomSchema)
