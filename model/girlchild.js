const mongoose = require("mongoose");

const girlChildSchema = new mongoose.Schema({
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
  currentEducation: {
    institution: {
      type: String,
      // required: true
    },
    highestQualification: {
      type: String,
      required: true,
    },
  },
  reasonsForFunds: {
    type: String,
    required: true,
  },
  guardianOrParentDetails: {
    guardianOrParentName: {
      type: String,
      required: true,
    },
    relationshipWithApplicant: {
      type: String,
      required: true,
    },
    employmentDetails: {
      type: String,
      required: true,
    },
  },
  annualHouseholdIncome: {
    type: Number,
    required: true,
  },

  bankDetails: {
    type: String,
    required: true,
  },
});

const GirlChildModel = mongoose.model(
  "GirlChildEducation_cause1",
  girlChildSchema
);

module.exports = GirlChildModel;
