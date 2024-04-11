const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { v4: uuid } = require("uuid");
// Function to upload files to S3
const s3client = new S3Client({ region: process.env.AWS_REGION });
const uploadcause1FilesToS3 = async (files, appId, s3client) => {
  return Promise.all(
    files.map(async (file) => {
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `GirlChildEducation/${appId}/${file.originalname}`,
        Body: file.buffer,
      };
      try {
        const data = await s3client.send(new PutObjectCommand(params));

        console.log(`File uploaded successfully: ${data}`);

        // Construct URL manually
        const location = `https://${params.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;
        return { key: params.Key, location: location };

        // return { key: params.Key, location: data.location };
      } catch (error) {
        console.error(`Error uploading file: ${error}`);
        throw error;
      }
    })
  );
};
module.exports = { uploadcause1FilesToS3, s3client };
/*exports.s3Uploadv3 = async (files, causeID, applicationId) => {
  const s3client = new S3Client({ region: process.env.AWS_REGION });

  const uploadPromises = files.map(async (file) => {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `cause1/${applicationId}/${uuid()}-${file.originalname}`,
      Body: file.buffer,
    };

    try {
      const data = await s3client.send(new PutObjectCommand(params));
      console.log(`File uploaded successfully: ${data}`);
      return data;
    } catch (error) {
      console.error(`Error uploading file: ${error}`);
      throw error;
    }
  });*

  try {
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error(`Error uploading files: ${error}`);
    throw error;
  }
};*/
/*const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require("uuid");

exports.s3Uploadv3 = async (files, causeID, applicationId) => {
  const s3client = new S3Client({ region: process.env.AWS_REGION });

  // Ensure files are provided
  if (!files || !Array.isArray(files)) {
    throw new Error("No files provided or files are not in array format.");
  }

  // Map each file to an upload promise
  const uploadPromises = files.map(async (file) => {
    // Generate a unique key for the file
    const key = `cause1/${applicationId}/${uuidv4()}-${file.originalname}`;

    // Define parameters for S3 upload
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
    };

    try {
      // Upload file to S3
      const data = await s3client.send(new PutObjectCommand(params));
      console.log(`File uploaded successfully: ${data}`);

      // Return the S3 object key
      return { key, location: data.Location };
    } catch (error) {
      console.error(`Error uploading file: ${error}`);
      throw error;
    }
  });

  try {
    // Wait for all upload promises to resolve
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error(`Error uploading files: ${error}`);
    throw error;
  }
};*/
