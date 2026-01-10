const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
dotenv.config();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(session({
  secret: 'mySecret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

mongoose.connect('mongodb://localhost:27017/registerPortalDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log("❌ MongoDB error:", err));

// Models
const getNextSequence = require('./public/utils/getNextSequence');
const Employee = require('./models/Employee');
const InplantStudent = require('./models/InplantStudent');
const InternshipStudent = require('./models/InternshipStudent');

// Excel Export: all-in-one
const exportAllToExcel = require('./saveAllToExcel');

// Middleware
function isAdmin(req, res, next) {
  if (req.session.isAdmin) return next();
  return res.redirect('/admin-login.html');
}

// Admin Login
app.post('/admin-login', (req, res) => {
  const { username, password } = req.body;
  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    req.session.isAdmin = true;
    res.redirect('/admin.html');
  } else {
    res.send("❌ Invalid credentials. <a href='/admin-login.html'>Try again</a>");
  }
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/admin-login.html');
  });
});

// API routes to return data as JSON
app.get('/admin/internships', isAdmin, async (req, res) => {
  const data = await InternshipStudent.find();
  res.json(data);
});

app.get('/admin/inplants', isAdmin, async (req, res) => {
  const data = await InplantStudent.find();
  res.json(data);
});

app.get('/admin/employees', isAdmin, async (req, res) => {
  const data = await Employee.find();
  res.json(data);
});

// Download all-in-one Excel file
app.get('/export-excel', isAdmin, async (req, res) => {
  try {
    await exportAllToExcel();
    const filePath = path.join(__dirname, 'AllRegisteredData.xlsx');
    res.download(filePath);
  } catch (err) {
    console.error('Error exporting Excel:', err);
    res.status(500).send('Failed to export Excel.');
  }
});

// Register employee
app.post('/register-employee', async (req, res) => {
  const sno = await getNextSequence("employee");
  await Employee.create({ ...req.body, sno });
  res.redirect('/success/employee');
});

// Register inplant
app.post('/register-inplant', async (req, res) => {
  const sno = await getNextSequence("inplant");
  await InplantStudent.create({ ...req.body, sno });
  res.redirect('/success/inplant');
});

// Register internship
app.post('/register-internship', async (req, res) => {
  const sno = await getNextSequence("internship");
  await InternshipStudent.create({ ...req.body, sno });
  res.redirect('/success/internship');
});

// Success Page
app.get('/success/:type', (req, res) => {
  const type = req.params.type;
  res.send(`
    <html>
      <head><title>Success</title><link rel="stylesheet" href="/style.css"></head>
      <body style="text-align:center;padding:50px;">
        <h2>✅ ${type.charAt(0).toUpperCase() + type.slice(1)} registered successfully!</h2>
        <br><a href="/index.html" class="btn">⬅ Back to Home</a>
      </body>
    </html>
  `);
});

app.listen(4000, () => console.log("🚀 Server running at http://localhost:4000"));
