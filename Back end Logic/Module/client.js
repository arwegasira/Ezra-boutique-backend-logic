const mongoose = require('mongoose')
const Schema = mongoose.Schema

const clientShema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First tName is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last Name is required'],
      trim: true,
    },
    middleName: {
      type: String,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    dob: {
      type: Date,
      trim: true,
    },
    gender: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      required: [true, 'Email is required'],
    },
    // id number and nationality not sure if needed
    idNumber: {
      type: String,
      required: [true, 'Id number is required'],
      trim: true,
      unique: true,
    },
    nationality: {
      type: String,
      require: [true, 'Nationality is required'],
      trim: true,
    },
    activeServices: {
      type: Array,
    },
    //address
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
    //work
    company: {
      type: String,
      trim: true,
    },
    profesional: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Client', clientShema)
