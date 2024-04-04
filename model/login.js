const mongoose = require("mongoose");
const LoginSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true, // This ensures that each email value must be unique
    required: true,
  }, // This ensures that the email field is required
  password: {
    type: String,
    required: true,
  },
});
const LoginModel = mongoose.model("LoginUsers", LoginSchema);
module.exports = LoginModel;
