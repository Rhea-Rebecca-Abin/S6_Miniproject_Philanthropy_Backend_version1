const mongoose = require("mongoose");

const applyStatusSchema = new mongoose.Schema({
  applicationId: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    //required:true,
    default: "processing",
  },
});

const Status = mongoose.model("Application_status", applyStatusSchema);

module.exports = Status;
