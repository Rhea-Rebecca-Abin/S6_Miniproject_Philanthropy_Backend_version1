require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const { s3Uploadv3 } = require("./s3service");
const app = express();
const uuid = require("uuid").v4;

//single file
/*app.post("/upload", upload.single("file"), (req, res) => {
  res.json({ status: "Success" });
});*/

/*const multiUpload = upload.fields([
  { name: "avatar", maxCount: 1 },
  { name: "resume", maxCount: 1 },
]);*/
/*app.post("/upload", multiUpload, (req, res) => {
  console.log(req.files);
  res.json({ status: "Success" });
});*/

//Multiple files

//Custom file name
/*const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    const { originalname } = file;
    cb(null, `${uuid()}-${originalname}`);
  },
});*/

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("File is not of the correct type"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  /*limits: {
    fileSize: 1024, // 1 MB limit
  },*/
});

/*app.post("/upload", upload.array("file"), (req, res) => {
  res.json({ status: "Success" });
});*/
app.post("/upload", upload.array("file"), async (req, res) => {
  try {
    const results = await s3Uploadv3(req.files);
    console.log(results);
    return res.json({ status: "success" });
  } catch (err) {
    console.log(err);
  }
});

/*app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.staus(400).json({
        message: "file is too large",
      });
    }

    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        message: "file  count exceeded",
      });
    }

    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        message: "file type unexpected",
      });
    }
  }
});*/
app.listen(4000, () => console.log("Listening on port 4000"));
