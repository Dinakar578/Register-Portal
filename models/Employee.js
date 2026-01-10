const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  sno: {
    type: Number,
    unique: true,
    required: true
  },
  name: String,
  email: String,
  phone: String,
  age: String,
  jobRole: String,
  experience: String
});

module.exports = mongoose.model('Employee', employeeSchema);
