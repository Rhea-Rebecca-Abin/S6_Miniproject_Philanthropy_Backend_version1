const mongoose = require("mongoose");
//const { v4: uuidv4 } = require("uuid");
const uploadfileSchema = new mongoose.Schema({
  applicationId: {
    type: String,
    required: true,
    unique: true,
  },
  birthCertificate: {
    type: [String],
    //required: true,
  },
  markCertificate: {
    type: [String],
    //required: true,
  },
});
const Filecause1 = mongoose.model("Cause1_files", uploadfileSchema);
module.exports = Filecause1;
