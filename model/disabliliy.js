const mongoose = require("mongoose");

const disabilitySchema = new mongoose.Schema({
  applicationId: {
    type: String,
    required: true,
    unique: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  contact: {
    phoneNumber: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
  },
  address: {
    type: String,
    required: true,
  },
  typeOfDisability: {
    type: String,
    required: true,
  },
  severityOfDisability: {
    type: String,
    required: true,
  },
  mobilityAids: {
    type: String,
    required: true,
  },
  dailyAssistance: {
    type: String,
    required: true,
  },
  employmentStatus: {
    type: String,
    required: true,
  },
  annualIncome: {
    type: Number,
    required: true,
  },
  supportNeeded: {
    type: String,
    required: true,
  },
  bankDetails: {
    type: String,
    required: true,
  },
});

const DisabilityModel = mongoose.model("DisabilitySupport", disabilitySchema);

module.exports = DisabilityModel;
