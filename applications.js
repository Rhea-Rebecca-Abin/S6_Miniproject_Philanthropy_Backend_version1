require("dotenv").config();
const multer = require("multer");
const upload = multer();
const express = require("express");

const mongoose = require("mongoose");

const { s3Uploadv3 } = require("./s3service");

const { v4: uuidv4 } = require("uuid");

const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const jwt = require("jsonwebtoken");
//const bcrypt = require("bcrypt");

const { secretKey } = require("./config");

app.use(express.json());
app.use(cors());
//app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
const GirlChildModel = require("./model/girlchild");
const GirlChildFile = require("./model/girlchild_files");
const Status = require("./model/apply_status");
mongoose.connect(
  "mongodb+srv://philafund:philafundsem62024@project-mernstack.xv0zhc5.mongodb.net/philanthropy"
);

app.post("/submitgirlchild", async (req, res) => {
  try {
    // Destructure required fields and nested sub-fields from request body
    const {
      fullName,
      dateOfBirth,
      contact,
      address,
      currentEducation,
      reasonsForFunds,
      guardianOrParentDetails,
      annualHouseholdIncome,
      bankDetails,
    } = req.body;

    // Extract sub-fields from nested objects
    const { phoneNumber, email } = contact;

    const { institution, highestQualification } = currentEducation;
    const {
      guardianOrParentName,
      relationshipWithApplicant,
      employmentDetails,
    } = guardianOrParentDetails;

    // Generate application ID using uuidv4()
    const applicationId = uuidv4();

    // Save application details to MongoDB
    const newApplication = new GirlChildModel({
      applicationId,
      fullName,
      dateOfBirth,
      contact: { phoneNumber, email },
      address,
      currentEducation: { institution, highestQualification },
      reasonsForFunds,
      guardianOrParentDetails: {
        guardianOrParentName,
        relationshipWithApplicant,
        employmentDetails,
      },
      annualHouseholdIncome,
      bankDetails,
    });
    await newApplication.save();

    res
      .status(201)
      .json({ message: "Application submitted successfully", applicationId });
  } catch (error) {
    console.error("Error submitting application:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

const { uploadcause1FilesToS3 } = require("./s3service");

const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { v4: uuid } = require("uuid");
// Function to upload files to S3
const s3client = new S3Client({ region: process.env.AWS_REGION });
app.post(
  "/uploadgirl/:appId",
  upload.fields([
    { name: "birthCertificate", maxCount: 1 },
    { name: "educationCertificate", maxCount: 1 },
    { name: "incomeCertificate", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const appId = req.params.appId;
      const birthCertificateFiles = req.files["birthCertificate"];
      const educationCertificateFiles = req.files["educationCertificate"];
      const incomeCertificateFiles = req.files["incomeCertificate"];
      // Upload birth certificate files to S3
      const birthCertificateUrls = await uploadcause1FilesToS3(
        birthCertificateFiles,
        appId,
        s3client
      );
      console.log(birthCertificateUrls);

      // Upload mark certificate files to S3
      const educationCertificateUrls = await uploadcause1FilesToS3(
        educationCertificateFiles,
        appId,
        s3client
      );
      console.log(educationCertificateUrls);

      const incomeCertificateUrls = await uploadcause1FilesToS3(
        incomeCertificateFiles,
        appId,
        s3client
      );
      console.log(incomeCertificateUrls);

      const newApplication = await GirlChildFile.create({
        applicationId: appId,
        birthCertificate: birthCertificateUrls.map((file) => file.location),
        educationCertificate: educationCertificateUrls.map(
          (file) => file.location
        ),
        incomeCertificate: incomeCertificateUrls.map((file) => file.location),
        // Include other fields if needed
      });
      console.log(newApplication);

      const applystatus = await Status.create({
        applicationId: appId,
      });

      if (newApplication && applystatus) {
        res.status(200).json({
          message: "Files uploaded and new application created successfully",
        });
      } else {
        res.status(500).json({ message: "Failed to create new application" });
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);
/*app.get("/girlchildapplicants", async (req, res) => {
  try {
    // Retrieve applicationIds with status "processing" from the third collection (application_statuses)
    const processingApplications = await Status.find({
      status: "processing",
    });

    // Extract applicationIds from processingApplications
    const processingApplicationIds = processingApplications.map(
      (app) => app.applicationId
    );

    // Retrieve all documents from the first collection (girlchildeducation_cause1)
    const girlChildApplications = await GirlChildModel.find({
      applicationId: { $in: processingApplicationIds },
    });

    // Retrieve all documents from the second collection (girlchild_files)
    const girlChildFiles = await GirlChildFile.find();

    // Combine the file URLs into an array
    const fileUrls = girlChildFiles.map((file) => file.url);

    // Send the response containing all application details and file URLs
    res.json({
      girlChildApplications: girlChildApplications,
      fileUrls: fileUrls,
    });
  } catch (error) {
    console.error("Error retrieving data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});*/

/*app.get("/retrieve", async (req, res) => {
  try {
    // Retrieve applicationIds with status "processing" from the third collection (application_statuses)
    const processingApplications = await Status.find({
      status: "processing",
    });

    // Extract applicationIds from processingApplications
    const processingApplicationIds = processingApplications.map(
      (app) => app.applicationId
    );

    // Retrieve all documents from the first collection (girlchildeducation_cause1)
    const girlChildApplications = await GirlChildModel.find({
      applicationId: { $in: processingApplicationIds },
    });

    // Retrieve all documents from the second collection (girlchild_files)
    const girlChildFiles = await GirlChildFile.find();

    // Combine the file URLs into an object keyed by applicationId
    const fileUrls = {};
    girlChildFiles.forEach((file) => {
      if (!fileUrls[file.applicationId]) {
        fileUrls[file.applicationId] = {};
      }
      fileUrls[file.applicationId][file.fieldName] = file.url;
    });

    // Create an array to hold the combined data of each application with corresponding file URLs
    const combinedData = girlChildApplications.map((application) => ({
      applicationDetails: application,
      fileUrls: fileUrls[application.applicationId] || {},
    }));

    // Send the response containing the combined data
    res.json({
      combinedData: combinedData,
    });
  } catch (error) {
    console.error("Error retrieving data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
*/
app.listen(1000, () => console.log("Listening on port 1000"));
