const mongoose = require('mongoose')
const Schema = mongoose.Schema

const clientShema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First tName is required'],
    },
    lastName: {
      type: String,
      required: [true, 'Last Name is required'],
    },
    middleName: {
      type: String,
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
    },
    dob: {
      type: Date,
    },
    gender: {
      type: String,
    },
    email: {
      type: String,
    },
    // id number and nationality not sure if needed
    idNumber: {
      type: String,
      required: [true, 'Id number is required'],
    },
    nationality: {
      type: String,
      require: [true, 'Nationality is required'],
    },
    activeServices: {
      type: Array,
    },
    //address
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    country: {
      type: String,
    },
    //work
    company: {
      type: String,
    },
    profesional: {
      type: String,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Client', clientShema)
