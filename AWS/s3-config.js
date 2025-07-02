const AWS = require('aws-sdk');
require('dotenv').config();

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const s3 = new AWS.S3();

// Create bucket if it doesn't exist
async function createBucket() {
  const bucketName = process.env.S3_BUCKET_NAME;
  
  try {
    // Check if bucket exists
    await s3.headBucket({ Bucket: bucketName }).promise();
    console.log(`Bucket ${bucketName} already exists`);
  } catch (error) {
    if (error.statusCode === 404) {
      // Bucket doesn't exist, create it
      try {
        await s3.createBucket({
          Bucket: bucketName,
          CreateBucketConfiguration: {
            LocationConstraint: process.env.AWS_REGION
          }
        }).promise();
        console.log(`Bucket ${bucketName} created successfully`);
        
        // Set CORS configuration
        const corsParams = {
          Bucket: bucketName,
          CORSConfiguration: {
            CORSRules: [{
              AllowedHeaders: ['*'],
              AllowedMethods: ['PUT', 'POST', 'DELETE', 'GET'],
              AllowedOrigins: ['*'],
              MaxAgeSeconds: 3000
            }]
          }
        };
        
        await s3.putBucketCors(corsParams).promise();
        console.log('CORS configuration set');
      } catch (createError) {
        console.error('Error creating bucket:', createError);
      }
    } else {
      console.error('Error checking bucket:', error);
    }
  }
}

module.exports = { s3, createBucket };