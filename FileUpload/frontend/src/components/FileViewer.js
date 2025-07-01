import React, { useState } from 'react';
import './FileViewer.css';

const FileViewer = ({ file, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const getFileExtension = (filename) => {
    return filename.split('.').pop().toLowerCase();
  };

  const renderFileContent = () => {
    const ext = getFileExtension(file.filename);
    const fileUrl = `/uploads/${file.filename}`;

    switch (ext) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return (
          <img
            src={fileUrl}
            alt={file.filename}
            className="file-preview-image"
            onLoad={() => setLoading(false)}
            onError={() => {
              setError(true);
              setLoading(false);
            }}
          />
        );

      case 'pdf':
        return (
          <iframe
            src={fileUrl}
            className="file-preview-pdf"
            title={file.filename}
            onLoad={() => setLoading(false)}
            onError={() => {
              setError(true);
              setLoading(false);
            }}
          />
        );

      case 'txt':
        return (
          <iframe
            src={fileUrl}
            className="file-preview-text"
            title={file.filename}
            onLoad={() => setLoading(false)}
            onError={() => {
              setError(true);
              setLoading(false);
            }}
          />
        );

      default:
        return (
          <div className="file-preview-unsupported">
            <div className="unsupported-icon">📄</div>
            <h3>Preview not available</h3>
            <p>This file type cannot be previewed in the browser.</p>
            <a
              href={fileUrl}
              download={file.filename}
              className="download-button-large"
            >
              Download to view
            </a>
          </div>
        );
    }
  };

  return (
    <div className="file-viewer-overlay" onClick={onClose}>
      <div className="file-viewer-modal" onClick={(e) => e.stopPropagation()}>
        <div className="file-viewer-header">
          <div className="file-info">
            <h3>{file.filename}</h3>
            <span className="file-size">
              {(file.size / 1024).toFixed(1)} KB
            </span>
          </div>
          <div className="file-actions">
            <a
              href={`/uploads/${file.filename}`}
              download={file.filename}
              className="action-btn download-btn"
              title="Download"
            >
              ⬇️
            </a>
            <button
              onClick={onClose}
              className="action-btn close-btn"
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="file-viewer-content">
          {loading && (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading preview...</p>
            </div>
          )}

          {error && (
            <div className="error-message">
              <p>Failed to load file preview</p>
              <a
                href={`/uploads/${file.filename}`}
                download={file.filename}
                className="download-button-large"
              >
                Download file instead
              </a>
            </div>
          )}

          {!error && renderFileContent()}
        </div>
      </div>
    </div>
  );
};

export default FileViewer;