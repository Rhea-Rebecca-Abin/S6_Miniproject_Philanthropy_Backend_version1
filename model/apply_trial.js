const mongoose = require("mongoose");
//const { v4: uuidv4 } = require("uuid");
const applySchema = new mongoose.Schema({
  name: {
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
  /*birthCertificate: {
    type: String,
    required: true,
  },
  markCertificate: {
    type: String,
    required: true,
  },*/
  applicationId: {
    type: String,
    required: true,
    unique: true,
  },
});
/*applySchema.pre("save", async function (next) {
  if (!this.applicationId) {
    this.applicationId = uuidv4(); // Generate UUID if not already provided
  }
  next();
});*/
const ApplyModel = mongoose.model("Apply_trial", applySchema);

module.exports = ApplyModel;

/*const mongoose = require("mongoose");

const applySchema = new mongoose.Schema({
  name: {
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
  birthCertificate: {
    type: String,
    required: true,
  },
  markCertificate: {
    type: String,
    required: true,
  },
  applicationId: {
    type: String,
    required: true,
    unique: true,
  },
});

// Custom function to generate human-readable application ID
function generateReadableApplicationId() {
  // Find the highest application ID in the database and increment it
  const latestApplication = ApplyModel.findOne(
    {},
    {},
    { sort: { applicationId: -1 } }
  );
  let nextApplicationNumber = 1;
  if (latestApplication) {
    const latestApplicationId = parseInt(
      latestApplication.applicationId.split("-")[1]
    );
    nextApplicationNumber = latestApplicationId + 1;
  }
  return `APP-${nextApplicationNumber}`;
}

applySchema.pre("save", async function (next) {
  if (!this.applicationId) {
    this.applicationId = generateReadableApplicationId();
  }
  next();
});

const ApplyModel = mongoose.model("Apply_trial", applySchema);

module.exports = ApplyModel;
*/
