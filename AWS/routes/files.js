const express = require('express');
const { s3 } = require('../s3-config');
const router = express.Router();

// Generate pre-signed URL for upload
router.post('/upload-url', async (req, res) => {
  try {
    const { fileName, fileType } = req.body;
    
    if (!fileName || !fileType) {
      return res.status(400).json({ error: 'fileName and fileType are required' });
    }
    
    const key = `uploads/${Date.now()}-${fileName}`;
    
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      ContentType: fileType,
      Expires: 300 // URL expires in 5 minutes
    };
    
    const uploadUrl = await s3.getSignedUrlPromise('putObject', params);
    
    res.json({
      uploadUrl,
      key,
      downloadUrl: `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
    });
  } catch (error) {
    console.error('Error generating upload URL:', error);
    res.status(500).json({ error: 'Failed to generate upload URL' });
  }
});

// Generate pre-signed URL for download
router.get('/download-url/:key(*)', async (req, res) => {
  try {
    const key = req.params.key;
    
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Expires: 300 // URL expires in 5 minutes
    };
    
    const downloadUrl = await s3.getSignedUrlPromise('getObject', params);
    
    res.json({ downloadUrl });
  } catch (error) {
    console.error('Error generating download URL:', error);
    res.status(500).json({ error: 'Failed to generate download URL' });
  }
});

// List files
router.get('/list', async (req, res) => {
  try {
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Prefix: 'uploads/'
    };
    
    const data = await s3.listObjectsV2(params).promise();
    
    const files = data.Contents.map(file => ({
      key: file.Key,
      name: file.Key.split('/').pop(),
      size: file.Size,
      lastModified: file.LastModified
    }));
    
    res.json({ files });
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({ error: 'Failed to list files' });
  }
});

// Delete file
router.delete('/:key(*)', async (req, res) => {
  try {
    const key = req.params.key;
    
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key
    };
    
    await s3.deleteObject(params).promise();
    
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

module.exports = router;