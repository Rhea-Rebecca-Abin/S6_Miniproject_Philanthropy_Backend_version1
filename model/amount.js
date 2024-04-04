const mongoose = require("mongoose");
const CauseAmountSchema = new mongoose.Schema({
  causeId: {
    type: String,
    required: true,
  },
  sum: {
    type: Number,
    default: 0,
  },
});

const CauseAmountModel = mongoose.model("CauseAmount", CauseAmountSchema);

module.exports = CauseAmountModel;
