const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const jwt = require("jsonwebtoken");
//const bcrypt = require("bcrypt");

const { secretKey } = require("./config");

const LoginModel = require("./model/login");
const DonorModel = require("./model/donor");
const CauseAmountModel = require("./model/amount");
app.use(express.json());
app.use(cors());

mongoose.connect(
  "mongodb+srv://philafund:philafundsem62024@project-mernstack.xv0zhc5.mongodb.net/philanthropy"
);

/*app.post("/register", (req, res) => {
  LoginModel.create(req.body)
    .then((LoginUsers) => res.json(LoginUsers))
    .catch((err) => res.json(err));
});*/

app.post("/register", (req, res) => {
  const { name, email, password } = req.body;

  LoginModel.findOne({ email: email })
    .then((user) => {
      if (user) {
        return res.status(409).json({
          status: "Error",
          error: "User already exists!",
        });
      } else {
        const newUser = new LoginModel({
          name: name,
          email: email,
          password: password,
        });

        newUser
          .save()
          .then(() => {
            console.log("Successfully inserted user details");
            return res.status(200).json({
              status: "Success",
              message: "User registered successfully",
            });
          })
          .catch((err) => {
            console.error("Error inserting user details:", err);
            return res.status(500).json({
              status: "Error",
              error: "Database Error, could not insert the given data",
            });
          });
      }
    })
    .catch((err) => {
      console.error("Database Error:", err);
      return res.status(500).json({
        status: "Error",
        error: "Database Error",
      });
    });
});

/*app.post("/login", (req, res) => {
  const { email, password } = req.body;
  LoginModel.findOne({ email: email }).then((user) => {
    if (user) {
      if (user.password === password) {
        res.json("Success");
      } else {
        res.json("The password is incorrect");
      }
    } else {
      res.json("This account does not exist");
    }
  });
});*/
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    // Find user by email
    const user = await LoginModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    // Compare passwords
    if (password !== user.password) {
      return res.status(401).json({ error: "Invalid password" });
    }
    // If login is successful, generate JWT token
    const token = jwt.sign({ userId: user._id }, secretKey, {
      expiresIn: "1h",
    });
    // Return token and user name
    res.json({ token, name: user.name });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
/*app.post("/donate/:causeId", async (req, res) => {
  try {
    // Extract the donor details from the request body
    const { name, email, ContactNo, Address, Amount } = req.body;
    const causeId = req.params.causeId; // Extract causeId from the route parameters
    console.log("Cause ID from route parameters:", causeId);
    // Create a new donor document including the causeId
    const newDonor = new DonorModel({
      name,
      email,
      ContactNo,
      Address,
      Amount,
      causeId,
    });

    // Save the donor to the database
    await newDonor.save();

    // Send a success response
    res.status(201).json({ message: "Donor details saved successfully" });
  } catch (error) {
    // Handle errors
    console.error("Error saving donor details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});*/
/*app.post("/donate", async (req, res) => {
  try {
    // Extract the donor details from the request body
    const { name, email, ContactNo, Address, Amount, causeId } = req.body;
    //const causeId = req.params.causeId; // Extract causeId from the route parameters
    //const causeId = req.params.causeId; // Convert causeId from string to number

    console.log("Cause ID ", causeId); // Log the causeId

    // Create a new donor document including the causeId
    const newDonor = new DonorModel({
      name,
      email,
      ContactNo,
      Address,
      Amount,
      causeId,
    });

    // Save the donor to the database
    await newDonor.save();

    // Send a success response
    res.status(201).json({ message: "Donor details saved successfully" });
  } catch (error) {
    // Check if the error is a duplicate key error
    if (
      error.code === 11000 &&
      error.keyValue &&
      error.keyValue.causeId === null
    ) {
      // Handle the specific case of causeId being null
      return res.status(400).json({ message: "Cause ID cannot be null" });
    }

    // Handle other errors
    console.error("Error saving donor details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
*/

/*app.post("/donate", async (req, res) => {
  try {
    // Extract the donor details from the request body
    const { name, email, ContactNo, Address, Amount, causeId } = req.body;

    // Log the extracted data
    console.log("Received data:", {
      name,
      email,
      ContactNo,
      Address,
      Amount,
      causeId,
    });

    // Create a new donor document
    const newDonor = new DonorModel({
      name,
      email,
      ContactNo,
      Address,
      Amount,
      causeId,
    });

    // Save the donor to the database
    await newDonor.save();

    // Send a success response
    res.status(201).json({ message: "Donor details saved successfully" });
  } catch (error) {
    // Handle errors
    console.error("Error saving donor details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});*/

// working coorectly simple V1POST request to save a new donor
/*app.post("/donate", async (req, res) => {
  try {
    // Extract the donor details from the request body
    const { name, email, contactNo, address, amount, causeId } = req.body;
    const collectionName = DonorModel.collection.name;
    console.log("Collection name:", collectionName);
    // Create a new donor document
    const newDonor = new DonorModel({
      name,
      email,
      contactNo,
      address,
      amount,
      causeId,
    });

    // Save the donor to the database
    await newDonor.save();

    // Send a success response
    res
      .status(201)
      .json({ message: "Donor details saved successfully", donor: newDonor });
  } catch (error) {
    // Handle errors
    console.error("Error saving donor details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
*/
/*Working ok with params 
app.post("/donate/:causeId", async (req, res) => {
  try {
    // Extract the donor details from the request body
    const { name, email, contactNo, address, amount } = req.body;
    const causeId = req.params.causeId; // Extract causeId from the URL parameters

    // Create a new donor document
    const newDonor = new DonorModel({
      name,
      email,
      contactNo,
      address,
      amount,
      causeId,
    });

    // Save the donor to the database
    await newDonor.save();

    // Send a success response
    res
      .status(201)
      .json({ message: "Donor details saved successfully", donor: newDonor });
  } catch (error) {
    // Handle errors
    console.error("Error saving donor details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
*/
app.post("/donate/:causeId", async (req, res) => {
  try {
    const { name, email, contactNo, address, amount } = req.body;
    const causeId = req.params.causeId;

    // Create a new donor document
    const newDonor = new DonorModel({
      name,
      email,
      contactNo,
      address,
      amount,
      causeId,
    });

    // Save the donor to the database
    await newDonor.save();

    // Update the cause_amount collection if causeId is valid (1 or 2)
    /*if (causeId === "1" || causeId === "2") {
      await CauseAmountModel.updateOne({ causeId }, { $inc: { sum: amount } });
    } else {
      throw new Error("Invalid causeId");
    }
*/
    // Update the cause_amount collection if causeId is valid (1 or 2)
    if (causeId === "1" || causeId === "2") {
      await CauseAmountModel.findOneAndUpdate(
        { causeId },
        { $inc: { sum: amount } },
        { new: true, upsert: false } // Set upsert option to false to prevent creating new documents
      );
    } else {
      throw new Error("Invalid causeId");
    }

    res
      .status(201)
      .json({ message: "Donor details saved successfully", donor: newDonor });
  } catch (error) {
    console.error("Error saving donor details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/*app.post("/donate/:causeId", async (req, res) => {
  try {
    // Extract the donor details from the request body
    const { name, email, ContactNo, Address, Amount } = req.body;
    const causeId = req.params.causeId; // Extract causeId from the route parameters

    // Validate causeId
    if (!causeId) {
      return res.status(400).json({ message: "Cause ID is required" });
    }

    console.log("Cause ID from route parameters:", causeId); // Log the causeId

    // Create a new donor document including the causeId
    const newDonor = new DonorModel({
      name,
      email,
      ContactNo,
      Address,
      Amount,
      causeId,
    });

    // Save the donor to the database
    await newDonor.save();

    // Send a success response
    res.status(201).json({ message: "Donor details saved successfully" });
  } catch (error) {
    // Handle errors
    console.error("Error saving donor details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
*/

/*app.post("/donate/:causeId", async (req, res) => {
  try {
    // Extract the donor details and donated amount from the request body
    const { name, email, ContactNo, Address, Amount } = req.body;
    const causeId = req.params.causeId; // Extract causeId from the route parameters

    // Find the cause with the provided causeId
    const cause = await CauseModel.findOne({ causeId });

    if (!cause) {
      return res.status(404).json({ message: "Cause not found" });
    }

    // Add the donated amount to the existing sum
    cause.Sum += Amount;

    // Update the sum in the database
    await cause.save();

    // Create a new donor document
    const newDonor = new DonorModel({
      name,
      email,
      ContactNo,
      Address,
      Amount,
      causeId,
    });

    // Save the donor to the database
    await newDonor.save();

    // Send a success response
    res.status(201).json({ message: "Donor details saved successfully" });
  } catch (error) {
    // Handle errors
    console.error("Error saving donor details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
*/
/*app.post("/donate/:causeId", async (req, res) => {
  try {
    // Extract the donor details and donated amount from the request body
    const { name, email, ContactNo, Address, Amount } = req.body;
    const causeId = req.params.causeId; // Extract causeId from the route parameters

    // Find the cause with the provided causeId
    const cause = await CauseModel.findOne({ causeID: causeId });

    if (!cause) {
      return res.status(404).json({ message: "Cause not found" });
    }

    // Add the donated amount to the existing sum
    cause.Sum += Amount;

    // Update the sum in the database
    await cause.save();

    // Create a new donor document
    const newDonor = new DonorModel({
      name,
      email,
      ContactNo,
      Address,
      Amount,
      causeId,
    });

    // Save the donor to the database
    await newDonor.save();

    // Send a success response
    res.status(201).json({ message: "Donor details saved successfully" });
  } catch (error) {
    // Handle errors
    console.error("Error saving donor details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
*/

/*app.post("/donate/:causeId", async (req, res) => {
  try {
    // Extract the donor details and donated amount from the request body
    const { name, email, ContactNo, Address, Amount } = req.body;
    const causeId = req.params.causeId; // Extract causeId from the route parameters

    // Create a new donor document
    const newDonor = new DonorModel({
      name,
      email,
      ContactNo,
      Address,
      Amount,
      causeId,
    });

    // Save the donor details to the 'Donors' collection
    await newDonor.save();

    // Find the cause with the provided causeId
    const cause = await CauseModel.findOne({ causeID: req.params.causeId });

    if (!cause) {
      return res.status(404).json({ message: "Cause not found" });
    }

    // Add the donated amount to the existing sum
    cause.Sum += Amount;

    // Update the sum in the database
    await cause.save();

    // Send a success response
    res.status(201).json({ message: "Donor details saved successfully" });
  } catch (error) {
    // Handle errors
    console.error("Error saving donor details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});*/
/*app.post("/donate/:causeId", async (req, res) => {
  try {
    // Extract the donor details and donated amount from the request body
    const { name, email, ContactNo, Address, Amount } = req.body;
    const causeId = req.params.causeId; // Extract causeId from the route parameters

    // Create a new donor document
    const newDonor = new DonorModel({
      name,
      email,
      ContactNo,
      Address,
      Amount,
      causeId,
    });

    // Save the donor details to the 'Donors' collection
    await newDonor.save();

    // Find the cause with the provided causeId
    const cause = await CauseModel.findOne({ causeID: req.params.causeId });

    if (!cause) {
      // If cause not found, return an error response
      return res.status(404).json({ message: "Cause not found" });
    }

    // Add the donated amount to the existing sum
    cause.Sum += Amount;

    // Update the sum in the database
    await cause.save();

    // Send a success response
    res.status(201).json({ message: "Donor details saved successfully" });
  } catch (error) {
    // Handle errors
    console.error("Error saving donor details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
*/
/*app.post("/donate/:causeId", async (req, res) => {
  try {
    // Extract the donor details and donated amount from the request body
    const { name, email, ContactNo, Address, Amount } = req.body;
    const causeId = req.params.causeId; // Extract causeId from the route parameters

    // Create a new donor document
    const newDonor = new DonorModel({
      name,
      email,
      ContactNo,
      Address,
      Amount,
      causeId,
    });

    // Save the donor details to the 'Donors' collection
    await newDonor.save();

    // Find the cause with the provided causeId
    const cause = await CauseModel.findOne({ causeID: causeId });

    if (!cause) {
      // If cause not found, return an error response
      return res.status(404).json({ message: "Cause not found" });
    }

    // Add the donated amount to the corresponding cause_amt
    cause.cause_amt += Amount;

    // Update the sum in the database
    await cause.save();

    // Send a success response
    res.status(201).json({ message: "Donor details saved successfully" });
  } catch (error) {
    // Handle errors
    console.error("Error saving donor details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
*/
/*app.post("/donate/:causeId", async (req, res) => {
  try {
    // Extract the donor details and donated amount from the request body
    const { name, email, ContactNo, Address, Amount } = req.body;
    const causeId = req.params.causeId; // Extract causeId from the route parameters

    // Create a new donor document
    const newDonor = new DonorModel({
      name,
      email,
      ContactNo,
      Address,
      Amount,
      causeId,
    });

    // Save the donor details to the 'Donors' collection
    await newDonor.save();

    // Find the cause with the provided causeId
    let cause = await CauseModel.findOne({ causeID: causeId });

    if (!cause) {
      // If cause not found, return an error response
      return res.status(404).json({ message: "Cause not found" });
    }

    // Add the donated amount to the corresponding cause_amt
    cause.cause_amt += Amount;

    // Update the sum in the database
    await CauseModel.updateOne(
      { causeID: causeId },
      { cause_amt: cause.cause_amt }
    );

    // Send a success response
    res.status(201).json({ message: "Donor details saved successfully" });
  } catch (error) {
    // Handle errors
    console.error("Error saving donor details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
*/

app.get("/display/:causeId", async (req, res) => {
  const causeId = req.params.causeId;
  try {
    const donors = await DonorModel.find({ causeId: causeId }).select(
      "-causeId"
    );
    if (donors.length === 0) {
      return res
        .status(404)
        .json({ error: "Donors not found for this cause ID" });
    }
    res.json(donors);
  } catch (err) {
    console.error("Error fetching donors", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(3001, () => {
  console.log("Server is running");
});
