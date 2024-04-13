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
const CauseAmountModel = require("./model/amount");
const DisabilityModel = require("./model/disabliliy");
const DisabilityFile = require("./model/disability_files");
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

/*app.get("/girl-child-applicants", async (req, res) => {
  try {
    // Retrieve application IDs with status as "processing"
    const processingApplications = await Status.find({ status: "processing" });
    const applicationIds = processingApplications.map(
      (app) => app.applicationId
    );

    // Retrieve details of applicants with "processing" status
    const applicants = await GirlChildModel.find({
      applicationId: { $in: applicationIds },
    });

    // Populate files for each applicant
    for (let i = 0; i < applicants.length; i++) {
      const applicant = applicants[i];
      const files = await GirlChildFile.findOne({
        applicationId: applicant.applicationId,
      });
      if (files) {
        applicant.birthCertificate = files.birthCertificate;
        applicant.educationCertificate = files.educationCertificate;
        applicant.incomeCertificate = files.incomeCertificate;
      }
    }

    res.json({ success: true, data: applicants });
  } catch (err) {
    console.error("Error fetching girl child applicants:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});*/
//Display the applicants of cause 1 for Admin
app.get("/girl-child-applicants", async (req, res) => {
  try {
    // Find application IDs with status "processing"
    const processingApplications = await Status.find({ status: "processing" });
    const applicationIds = processingApplications.map(
      (app) => app.applicationId
    );

    // Find applicants with application IDs and populate their file URLs
    const applicants = await GirlChildModel.find({
      applicationId: { $in: applicationIds },
    })
      .select("-_id -__v") // Exclude _id and __v fields
      .populate("contact")
      .populate("currentEducation")
      .populate("guardianOrParentDetails")
      .lean(); // Convert to plain JavaScript objects

    // Populate file URLs for each applicant
    for (const applicant of applicants) {
      const files = await GirlChildFile.findOne({
        applicationId: applicant.applicationId,
      });
      if (files) {
        applicant.fileURLs = {
          birthCertificate: files.birthCertificate,
          educationCertificate: files.educationCertificate,
          incomeCertificate: files.incomeCertificate,
        };
      }
    }

    res.json({ success: true, data: applicants });
  } catch (error) {
    console.error("Error fetching girl child applicants:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});
//ACCEPT Cause 1- by Admin
app.post("/acceptgirlchild/:applicationId", async (req, res) => {
  try {
    const { applicationId } = req.params;

    // Fetch the cause amount corresponding to causeId 1
    const causeAmount = await CauseAmountModel.findOne({ causeId: "1" });

    if (!causeAmount) {
      return res.status(404).json({ message: "Cause amount not found" });
    }

    // Check if the amount is greater than or equal to 2000
    if (causeAmount.sum >= 2000) {
      // Update the status of the application to approved
      await Status.findOneAndUpdate(
        { applicationId },
        { $set: { status: "approved" } }
      );

      // Deduct 2000 from the cause amount
      await CauseAmountModel.findOneAndUpdate(
        { causeId: "1" },
        { $inc: { sum: -2000 } }
      );

      return res.status(200).json({ message: "Application approved" });
    } else {
      // Update the status of the application to waiting list
      await Status.findOneAndUpdate(
        { applicationId },
        { $set: { status: "waiting list" } }
      );

      return res
        .status(200)
        .json({ message: "Application added to waiting list" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});
//REJECT - by Admin same for both causes
app.post("/reject/:applicationId", async (req, res) => {
  try {
    const { applicationId } = req.params;

    // Update the status of the application to rejected
    await Status.findOneAndUpdate(
      { applicationId },
      { $set: { status: "rejected" } }
    );

    return res.status(200).json({ message: "Application rejected" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});
/*
app.get("/check-status/:applicationId", async (req, res) => {
  try {
    const { applicationId } = req.params;

    // Find the application status based on the applicationId
    const applicationStatus = await Status.findOne({ applicationId });

    if (!applicationStatus) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Get the status from the application status object
    //const STatus = Status.status;

    // Display the status to the user
    const mess = `Your application status is "${applicationStatus.status}"`;
    return res.status(200).json({
      message: `Your application status is {mess}',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});*/
//Check status for the applicant
app.get("/check-status/:applicationId", async (req, res) => {
  try {
    const { applicationId } = req.params;

    // Find the application status based on the applicationId
    const applicationStatus = await Status.findOne({ applicationId });

    if (!applicationStatus) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Retrieve the status from the application status object
    const status = applicationStatus.status;
    const cleanStatus = status.replace(/\\/g, "");
    // Display the status to the user
    const message = `Your application status is "${cleanStatus}"`;
    return res.status(200).json({ message });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});
//Display the sum amount corresponding to each causeId - for Admin
app.get("/sum-amount/:causeId", async (req, res) => {
  try {
    const { causeId } = req.params;

    // Find the cause amount based on the causeId
    const causeAmount = await CauseAmountModel.findOne({ causeId });

    if (!causeAmount) {
      return res.status(404).json({ message: "Cause amount not found" });
    }

    // Retrieve the sum from the cause amount object
    const sum = causeAmount.sum;

    // Display the sum to the user
    return res.status(200).json({ sum });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});
//Second cause application
app.post("/submitdisability", async (req, res) => {
  try {
    // Destructure required fields and nested sub-fields from request body
    const {
      fullName,
      dateOfBirth,
      contact,
      address,
      typeOfDisability,
      severityOfDisability,
      mobilityAids,
      dailyAssistance,
      employmentStatus,
      annualIncome,
      supportNeeded,
      bankDetails,
    } = req.body;

    // Extract sub-fields from nested objects
    const { phoneNumber, email } = contact;

    // Generate application ID using uuidv4()
    const applicationId = uuidv4();

    // Save application details to MongoDB
    const newApplication = new DisabilityModel({
      applicationId,
      fullName,
      dateOfBirth,
      contact: { phoneNumber, email },
      address,
      typeOfDisability,
      severityOfDisability,
      mobilityAids,
      dailyAssistance,
      employmentStatus,
      annualIncome,
      supportNeeded,
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
//File upload second cause
const { uploadcause2FilesToS3 } = require("./s3service");

// Function to upload files to S3

app.post(
  "/upload-disability/:appId",
  upload.fields([
    { name: "idProof", maxCount: 1 },
    { name: "medicalCertificate", maxCount: 1 },
    { name: "medicalRecords", maxCount: 1 },
    { name: "incomeCertificate", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const appId = req.params.appId;
      const idProofFiles = req.files["idProof"];
      const medicalCertificateFiles = req.files["medicalCertificate"];
      const medicalRecordsFiles = req.files["medicalRecords"];
      const incomeCertificateFiles = req.files["incomeCertificate"];

      // Upload idProof files to S3
      const idProofUrls = await uploadcause2FilesToS3(
        idProofFiles,
        appId,
        s3client
      );
      console.log(idProofUrls);

      // Upload medicalCertificate files to S3
      const medicalCertificateUrls = await uploadcause2FilesToS3(
        medicalCertificateFiles,
        appId,
        s3client
      );
      console.log(medicalCertificateUrls);

      // Upload medicalRecords files to S3
      const medicalRecordsUrls = await uploadcause2FilesToS3(
        medicalRecordsFiles,
        appId,
        s3client
      );
      console.log(medicalRecordsUrls);

      // Upload incomeCertificate files to S3
      const incomeCertificateUrls = await uploadcause2FilesToS3(
        incomeCertificateFiles,
        appId,
        s3client
      );
      console.log(incomeCertificateUrls);

      // Save file details to MongoDB
      const newFiles = await DisabilityFile.create({
        applicationId: appId,
        idProof: idProofUrls.map((file) => file.location),
        medicalCertificate: medicalCertificateUrls.map((file) => file.location),
        medicalRecords: medicalRecordsUrls.map((file) => file.location),
        incomeCertificate: incomeCertificateUrls.map((file) => file.location),
      });
      console.log(newFiles);

      const applystatus = await Status.create({
        applicationId: appId,
      });

      if (newFiles && applystatus) {
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
//Display details of applicants of second cause
app.get("/disability-applicants", async (req, res) => {
  try {
    // Find application IDs with status "processing"
    const processingApplications = await Status.find({ status: "processing" });
    const applicationIds = processingApplications.map(
      (app) => app.applicationId
    );

    // Find applicants with application IDs and populate their file URLs
    const applicants = await DisabilityModel.find({
      applicationId: { $in: applicationIds },
    })
      .select("-_id -__v") // Exclude _id and __v fields
      .populate("contact")
      .lean(); // Convert to plain JavaScript objects

    // Populate file URLs for each applicant
    for (const applicant of applicants) {
      const files = await DisabilityFile.findOne({
        applicationId: applicant.applicationId,
      });
      if (files) {
        applicant.fileURLs = {
          idProof: files.idProof,
          medicalCertificate: files.medicalCertificate,
          medicalRecords: files.medicalRecords,
          incomeCertificate: files.incomeCertificate,
        };
      }
    }

    res.json({ success: true, data: applicants });
  } catch (error) {
    console.error("Error fetching disability applicants:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});
//ACCEPT - Second cause by Admin
app.post("/acceptdisability/:applicationId", async (req, res) => {
  try {
    const { applicationId } = req.params;

    // Fetch the cause amount corresponding to causeId 1
    const causeAmount = await CauseAmountModel.findOne({ causeId: "2" });

    if (!causeAmount) {
      return res.status(404).json({ message: "Cause amount not found" });
    }

    // Check if the amount is greater than or equal to 2000
    if (causeAmount.sum >= 5000) {
      // Update the status of the application to approved
      await Status.findOneAndUpdate(
        { applicationId },
        { $set: { status: "approved" } }
      );

      // Deduct 5000 from the cause amount
      await CauseAmountModel.findOneAndUpdate(
        { causeId: "2" },
        { $inc: { sum: -5000 } }
      );

      return res.status(200).json({ message: "Application approved" });
    } else {
      // Update the status of the application to waiting list
      await Status.findOneAndUpdate(
        { applicationId },
        { $set: { status: "waiting list" } }
      );

      return res
        .status(200)
        .json({ message: "Application added to waiting list" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(1000, () => console.log("Listening on port 1000"));
