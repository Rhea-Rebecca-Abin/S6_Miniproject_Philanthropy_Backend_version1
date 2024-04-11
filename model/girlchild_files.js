const mongoose = require("mongoose");
//const { v4: uuidv4 } = require("uuid");
const girlchildfileSchema = new mongoose.Schema({
  applicationId: {
    type: String,
    required: true,
    unique: true,
  },
  birthCertificate: {
    type: [String],
    //required: true,
  },
  educationCertificate: {
    type: [String],
    //required: true,
  },
  incomeCertificate: {
    type: [String],
  },
});
const GirlChildFile = mongoose.model("Girlchild_files", girlchildfileSchema);
module.exports = GirlChildFile;
