const AWS = require('aws-sdk');
require('dotenv').config();

// Validate required environment variables
const requiredEnvVars = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION', 'S3_BUCKET_NAME'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('Missing required environment variables:', missingVars);
  console.error('Please check your .env file and ensure all required variables are set.');
  process.exit(1);
}

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
  
  console.log(`Checking bucket: ${bucketName}`);
  
  try {
    // Check if bucket exists
    await s3.headBucket({ Bucket: bucketName }).promise();
    console.log(`Bucket ${bucketName} already exists`);
  } catch (error) {
    if (error.statusCode === 404) {
      // Bucket doesn't exist, create it
      try {
        const createParams = {
          Bucket: bucketName
        };
        
        // Only add LocationConstraint if not us-east-1
        if (process.env.AWS_REGION !== 'us-east-1') {
          createParams.CreateBucketConfiguration = {
            LocationConstraint: process.env.AWS_REGION
          };
        }
        
        await s3.createBucket(createParams).promise();
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
        throw createError;
      }
    } else {
      console.error('Error checking bucket:', error);
      throw error;
    }
  }
}

module.exports = { s3, createBucket };