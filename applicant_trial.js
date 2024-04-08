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
// Assuming you have your S3 upload function defined in s3Upload.js
const ApplyModel = require("./model/apply_trial");
const Filecause1 = require("./model/upload_files");
// Assuming your Mongoose model is defined in ApplyModel.js

// parse application/json
// Multer configuration for file upload

mongoose.connect(
  "mongodb+srv://philafund:philafundsem62024@project-mernstack.xv0zhc5.mongodb.net/philanthropy"
);
// POST route to submit application details and upload files
/*app.post(
  "/submit",
  upload.fields([
    { name: "birthCertificate", maxCount: 1 },
    { name: "markCertificate", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { name, contactNo, address } = req.body;
      const appId = uuidv4();
      // Upload files to S3
      const birthCertificateFiles = req.files["birthCertificate"];
      const markCertificateFiles = req.files["markCertificate"];

      const uploadedBirthCertificate = await s3Uploadv3(
        birthCertificateFiles,
        "cause1",
        uuidv4()
      );
      const uploadedMarkCertificate = await s3Uploadv3(
        markCertificateFiles,
        "cause1",
        uuidv4()
      );

      //Extract S3 URLs from the upload responses
      const birthCertificateUrl = uploadedBirthCertificate[0].Location;
      const markCertificateUrl = uploadedMarkCertificate[0].Location;
      console.log("Uploaded birth certificate URL:", birthCertificateUrl); // Log the URL
      console.log("Uploaded mark certificate URL:", markCertificateUrl);
      // Save application details along with file URLs to MongoDB
      const newApplication = new ApplyModel({
        name,
        contactNo,
        address,
        birthCertificate: birthCertificateUrl,
        markCertificate: markCertificateUrl,
        applicationId: appId,
      });
      await newApplication.save();

      res.status(201).json({ message: "Application submitted successfully" });
    } catch (error) {
      console.error("Error submitting application:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);*/
/*app.post(
  "/submit",
  upload.fields([
    { name: "birthCertificate", maxCount: 1 },
    { name: "markCertificate", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { name, contactNo, address } = req.body;

      console.log(
        "Entered data - Name:",
        name,
        "Contact No:",
        contactNo,
        "Address:",
        address
      ); // Log entered data

      const appId = uuidv4();
      // Upload files to S3
      const birthCertificateFiles = req.files["birthCertificate"];
      const markCertificateFiles = req.files["markCertificate"];

      const uploadedBirthCertificate = await s3Uploadv3(
        birthCertificateFiles,
        "cause1",
        uuidv4()
      );
      const uploadedMarkCertificate = await s3Uploadv3(
        markCertificateFiles,
        "cause1",
        uuidv4()
      );

      console.log("Uploaded birth certificate:", uploadedBirthCertificate); // Log uploaded birth certificate
      console.log("Uploaded mark certificate:", uploadedMarkCertificate); // Log uploaded mark certificate

      //Extract S3 URLs from the upload responses
      const birthCertificateUrl = uploadedBirthCertificate[0].Location;
      const markCertificateUrl = uploadedMarkCertificate[0].Location;
      console.log("Uploaded birth certificate URL:", birthCertificateUrl); // Log the URL
      console.log("Uploaded mark certificate URL:", markCertificateUrl);

      // Save application details along with file URLs to MongoDB
      const newApplication = new ApplyModel({
        name,
        contactNo,
        address,
        //birthCertificate: birthCertificateUrl,
        //markCertificate: markCertificateUrl,
        applicationId: appId,
      });
      await newApplication.save();

      res.status(201).json({ message: "Application submitted successfully" });
    } catch (error) {
      console.error("Error submitting application:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);*/

app.post("/submit", async (req, res) => {
  try {
    const { name, contactNo, address } = req.body;
    const applicationId = uuidv4(); // Generate applicationId using uuidv4()

    // Save application details to MongoDB
    const newApplication = new ApplyModel({
      name,
      contactNo,
      address,
      applicationId,
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

const { uploadFilesToS3 } = require("./s3service");
/*app.post(
  "/upload/:appId",
  upload.fields([
    { name: "birthCertificate", maxCount: 1 },
    { name: "markCertificate", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const appId = req.params.appId;
      const birthCertificateFiles = req.files["birthCertificate"];
      const markCertificateFiles = req.files["markCertificate"];

      // Function to upload files to S3
      const uploadFilesToS3 = async (files, folderName) => {
        return Promise.all(
          files.map(async (file) => {
            const params = {
              Bucket: process.env.AWS_BUCKET_NAME,
              Key: `cause1/${appId}/${folderName}/${file.originalname}`,
              Body: file.buffer,
            };
            return s3client.send(new PutObjectCommand(params));
          })
        );
      };

      // Upload birth certificate files to S3
      const uploadedBirthCertificate = await uploadFilesToS3(
        birthCertificateFiles,
        "birthCertificate"
      );

      // Upload mark certificate files to S3
      const uploadedMarkCertificate = await uploadFilesToS3(
        markCertificateFiles,
        "markCertificate"
      );

      // Extract URLs of uploaded files
      const birthCertificateUrls = uploadedBirthCertificate.map(
        (file) => file.Location
      );
      const markCertificateUrls = uploadedMarkCertificate.map(
        (file) => file.Location
      );

      // Save file URLs along with application ID to MongoDB
      const application = await ApplyModel.findOneAndUpdate(
        { applicationId: appId },
        {
          $set: {
            birthCertificateUrls: birthCertificateUrls,
            markCertificateUrls: markCertificateUrls,
          },
        },
        { new: true }
      );

      res.status(200).json({ message: "Files uploaded successfully" });
    } catch (error) {
      console.error("Error uploading files:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);*/

// POST route to submit application details and upload files
/*app.post(
  "/submit",
  upload.fields([
    { name: "birthCertificate", maxCount: 1 },
    { name: "markCertificate", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      // Check if files are present in the request
      if (!req.files || Object.keys(req.files).length === 0) {
        throw new Error("No files were uploaded.");
      }

      // Extract application details from request body
      const { name, contactNo, address } = req.body;
      const appId = uuidv4();

      // Upload files to S3
      const birthCertificateFiles = req.files["birthCertificate"][0];
      const markCertificateFiles = req.files["markCertificate"][0];

      const uploadedBirthCertificate = await s3Uploadv3(
        birthCertificateFiles,
        "cause1",
        appId
      );
      const uploadedMarkCertificate = await s3Uploadv3(
        markCertificateFiles,
        "cause1",
        appId
      );

      // Extract S3 URLs from the upload responses
      const birthCertificateUrl = uploadedBirthCertificate[0].location;
      const markCertificateUrl = uploadedMarkCertificate[0].location;
      console.log("Uploaded birth certificate URL:", birthCertificateUrl); // Log the URL
      console.log("Uploaded mark certificate URL:", markCertificateUrl);

      // Save application details along with file URLs to MongoDB
      const newApplication = new ApplyModel({
        name,
        contactNo,
        address,
        birthCertificate: birthCertificateUrl,
        markCertificate: markCertificateUrl,
        applicationId: appId,
      });
      await newApplication.save();

      res.status(201).json({ message: "Application submitted successfully" });
    } catch (error) {
      console.error("Error submitting application:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);*/
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { v4: uuid } = require("uuid");
// Function to upload files to S3
const s3client = new S3Client({ region: process.env.AWS_REGION });
app.post(
  "/upload/:appId",
  upload.fields([
    { name: "birthCertificate", maxCount: 1 },
    { name: "markCertificate", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const appId = req.params.appId;
      const birthCertificateFiles = req.files["birthCertificate"];
      const markCertificateFiles = req.files["markCertificate"];

      // Upload birth certificate files to S3
      const birthCertificateUrls = await uploadFilesToS3(
        birthCertificateFiles,
        appId,
        s3client
      );
      console.log(birthCertificateUrls);

      // Upload mark certificate files to S3
      const markCertificateUrls = await uploadFilesToS3(
        markCertificateFiles,
        appId,
        s3client
      );
      console.log(markCertificateUrls);
      const newApplication = await Filecause1.create({
        applicationId: appId,
        birthCertificate: birthCertificateUrls.map((file) => file.location),
        markCertificate: markCertificateUrls.map((file) => file.location),

        // Include other fields if needed
      });
      console.log(newApplication);

      if (newApplication) {
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
//Save file URLs along with application ID to MongoDB
/*const application = await Filecause1.findOneAndUpdate(
        { applicationId: appId },
        {
          $set: {
            birthCertificateUrls: birthCertificateUrls.map(
              (file) => file.Location
            ),
            markCertificateUrls: markCertificateUrls.map(
              (file) => file.Location
            ),
          },
        },
        { new: true }
      );

      res.status(200).json({ message: "Files uploaded successfully" });
    } catch (error) {
      console.error("Error uploading files:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);*/

app.listen(6000, () => console.log("Listening on port 6000"));
