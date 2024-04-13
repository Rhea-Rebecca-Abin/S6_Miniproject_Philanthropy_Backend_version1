const mongoose = require("mongoose");
//const { v4: uuidv4 } = require("uuid");
const disabilityfileSchema = new mongoose.Schema({
  applicationId: {
    type: String,
    required: true,
    unique: true,
  },
  idProof: {
    type: [String],
    //required: true,
  },
  medicalCertificate: {
    type: [String],
    //required: true,
  },
  medicalRecords: {
    type: [String],
  },
  incomeCertificate: {
    type: [String],
  },
});
const DisabilityFile = mongoose.model("Disability_files", disabilityfileSchema);
module.exports = DisabilityFile;
