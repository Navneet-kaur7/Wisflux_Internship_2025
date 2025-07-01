import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FileViewer from './FileViewer';
import './FileList.css';

const FileList = ({ refreshTrigger, onFileDelete }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchFiles();
  }, [refreshTrigger]);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/files');
      setFiles(response.data.files);
      setError('');
    } catch (err) {
      setError('Failed to fetch files');
      console.error('Error fetching files:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (filename) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        await axios.delete(`/api/files/${filename}`);
        setFiles(files.filter(file => file.filename !== filename));
        onFileDelete();
      } catch (err) {
        setError('Failed to delete file');
        console.error('Error deleting file:', err);
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getFileExtension = (filename) => {
    return filename.split('.').pop().toLowerCase();
  };

  const getFileIcon = (filename) => {
    const ext = getFileExtension(filename);
    const imageExts = ['jpg', 'jpeg', 'png', 'gif'];
    const docExts = ['doc', 'docx'];
    const pdfExts = ['pdf'];
    
    if (imageExts.includes(ext)) return '🖼️';
    if (docExts.includes(ext)) return '📄';
    if (pdfExts.includes(ext)) return '📕';
    return '📎';
  };

  const canPreviewFile = (filename) => {
    const ext = getFileExtension(filename);
    const previewableExts = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'txt'];
    return previewableExts.includes(ext);
  };

  const handleViewFile = (file) => {
    setSelectedFile(file);
  };

  const closeViewer = () => {
    setSelectedFile(null);
  };

  if (loading) {
    return <div className="file-list-container">Loading files...</div>;
  }

  return (
    <div className="file-list-container">
      <h2>Uploaded Files</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      {files.length === 0 ? (
        <div className="no-files">
          <p>No files uploaded yet.</p>
        </div>
      ) : (
        <div className="files-grid">
          {files.map((file, index) => (
            <div key={index} className="file-card">
              <div className="file-icon">
                {getFileIcon(file.filename)}
              </div>
              
              <div className="file-info">
                <h3 className="file-name" title={file.filename}>
                  {file.filename}
                </h3>
                <p className="file-size">{formatFileSize(file.size)}</p>
                <p className="file-date">{formatDate(file.uploadDate)}</p>
              </div>
              
              <div className="file-actions">
                <button
                  onClick={() => handleViewFile(file)}
                  className="action-button view-button"
                  title="View file"
                >
                  👁️
                </button>
                
                <a
                  href={`/uploads/${file.filename}`}
                  download={file.filename}
                  className="action-button download-button"
                  title="Download file"
                >
                  ⬇️
                </a>
                
                <button
                  onClick={() => handleDelete(file.filename)}
                  className="action-button delete-button"
                  title="Delete file"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="files-summary">
        <p>Total files: {files.length}</p>
        <p>
          Total size: {formatFileSize(
            files.reduce((total, file) => total + file.size, 0)
          )}
        </p>
      </div>
      
      {selectedFile && (
        <FileViewer
          file={selectedFile}
          onClose={closeViewer}
        />
      )}
    </div>
  );
};

export default FileList;