import React, { useState } from 'react';
import axios from 'axios';
import './FileUpload.css';

const FileUpload = ({ onFileUpload }) => {
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadType, setUploadType] = useState('single');

  const handleFileSelect = (e) => {
    setSelectedFiles(e.target.files);
    setMessage('');
  };

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      setMessage('Please select files to upload');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();

    if (uploadType === 'single') {
      formData.append('file', selectedFiles[0]);
    } else {
      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append('files', selectedFiles[i]);
      }
    }

    try {
      const endpoint = uploadType === 'single' ? '/api/upload/single' : '/api/upload/multiple';
      
      const response = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      setMessage('Upload successful!');
      
      const uploadedFiles = uploadType === 'single' 
        ? [response.data.file] 
        : response.data.files;
      
      onFileUpload(uploadedFiles);
      
      setSelectedFiles(null);
      document.getElementById('fileInput').value = '';
      
    } catch (error) {
      setMessage('Upload failed: ' + (error.response?.data?.error || error.message));
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="file-upload-container">
      <h2>Upload Files</h2>
      
      <div className="upload-type-selector">
        <label>
          <input
            type="radio"
            value="single"
            checked={uploadType === 'single'}
            onChange={(e) => setUploadType(e.target.value)}
          />
          <span>Single File</span>
        </label>
        <label>
          <input
            type="radio"
            value="multiple"
            checked={uploadType === 'multiple'}
            onChange={(e) => setUploadType(e.target.value)}
          />
          <span>Multiple Files</span>
        </label>
      </div>

      <div className="file-input-container">
        <input
          id="fileInput"
          type="file"
          multiple={uploadType === 'multiple'}
          onChange={handleFileSelect}
          accept=".jpg,.jpeg,.png,.gif,.pdf,.txt,.doc,.docx"
          disabled={uploading}
        />
      </div>

      {selectedFiles && (
        <div className="file-preview">
          <h3>Selected Files:</h3>
          <ul>
            {Array.from(selectedFiles).map((file, index) => (
              <li key={index}>
                <span className="file-name">{file.name}</span>
                <span className="file-size">{formatFileSize(file.size)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!selectedFiles || uploading}
        className="upload-button"
      >
        {uploading ? 'Uploading...' : 'Upload Files'}
      </button>

      {uploading && (
        <div className="progress-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <span className="progress-text">{uploadProgress}%</span>
        </div>
      )}

      {message && (
        <div className={`message ${message.includes('successful') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default FileUpload;