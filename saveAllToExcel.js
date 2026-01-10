const mongoose = require('mongoose');
const ExcelJS = require('exceljs');
const Employee = require('./models/Employee');
const InplantStudent = require('./models/InplantStudent');
const InternshipStudent = require('./models/InternshipStudent');

async function exportAllToExcel() {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect('mongodb://127.0.0.1:27017/register-portal', {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      console.log('MongoDB connected for export');
    }

    const employees = await Employee.find().lean();
    const inplants = await InplantStudent.find().lean();
    const internships = await InternshipStudent.find().lean();

    const addSNoAndRemoveId = (data) =>
      data.map((item, index) => {
        const { _id, __v, sno, ...rest } = item; // 👈 also remove `sno`
        return { 'S.No': index + 1, ...rest };
      });

    const workbook = new ExcelJS.Workbook();

    // Employees Sheet
    const employeeSheet = workbook.addWorksheet('Employees');
    const employeeData = addSNoAndRemoveId(employees);
    if (employeeData.length > 0) {
      employeeSheet.columns = Object.keys(employeeData[0]).map(key => ({ header: key, key }));
      employeeSheet.addRows(employeeData);
    }

    // Inplant Students Sheet
    const inplantSheet = workbook.addWorksheet('Inplant Students');
    const inplantData = addSNoAndRemoveId(inplants);
    if (inplantData.length > 0) {
      inplantSheet.columns = Object.keys(inplantData[0]).map(key => ({ header: key, key }));
      inplantSheet.addRows(inplantData);
    }

    // Internship Students Sheet
    const internshipSheet = workbook.addWorksheet('Internship Students');
    const internshipData = addSNoAndRemoveId(internships);
    if (internshipData.length > 0) {
      internshipSheet.columns = Object.keys(internshipData[0]).map(key => ({ header: key, key }));
      internshipSheet.addRows(internshipData);
    }

    await workbook.xlsx.writeFile('AllRegisteredData.xlsx');
    console.log("✅ Excel file 'AllRegisteredData.xlsx' generated");
  } catch (error) {
    console.error("❌ Error creating Excel file:", error.message);
  }
}

module.exports = exportAllToExcel;
