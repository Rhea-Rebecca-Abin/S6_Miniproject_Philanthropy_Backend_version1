const mongoose = require("mongoose");

const DonorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  contactNo: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    validate: {
      validator: function (value) {
        return value > 0; // Check if the amount is greater than zero
      },
      message: "Amount must be greater than zero",
    },
    required: true,
  },
  causeId: {
    type: String, // Assuming causeId is represented as a string
    required: true,
  },
});

const DonorModel = mongoose.model("Donor", DonorSchema);

/*const CauseSchema = new mongoose.Schema({
  causeID: {
    type: Number, // Assuming causeId is represented as a number

    unique: true,
  },

  Sum: {
    type: Number, // Assuming causeId is represented as a number
  },
});
const CauseModel = mongoose.model("Cause_Amount", CauseSchema);*/
module.exports = DonorModel;
//module.exports = CauseModel;
