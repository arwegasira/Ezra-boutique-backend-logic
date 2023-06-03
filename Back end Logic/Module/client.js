const mongoose = require('mongoose')
const Schema = mongoose.Schema

const clientShema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First is required'],
    },
    lastName: {
      type: String,
      required: [true, 'Last is required'],
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
    },
    email: {
      type: String,
      unique: true,
    },
    // id number and nationality not sure if needed
    activeServices: {
      type: Array,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Client', clientShema)
