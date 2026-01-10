const mongoose = require('mongoose');

const internshipStudentSchema = new mongoose.Schema({
  sno: {
    type: Number,
    unique: true,
    required: true
  },
  name: String,
  email: String,
  phone: String,
  college: String,
  department: String,
  passedOutYear: String,
  age: String,
  course: String,
  duration: String
});

module.exports = mongoose.model('InternshipStudent', internshipStudentSchema);
