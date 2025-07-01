import React, { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import FileList from './components/FileList';
import './App.css';

function App() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [refreshFiles, setRefreshFiles] = useState(0);

  const handleFileUpload = (files) => {
    setUploadedFiles(prev => [...prev, ...files]);
    setRefreshFiles(prev => prev + 1);
  };

  const handleFileDelete = () => {
    setRefreshFiles(prev => prev + 1);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>File Upload MERN App</h1>
        <p>Upload and manage your files easily</p>
      </header>
      
      <main className="App-main">
        <div className="upload-section">
          <FileUpload onFileUpload={handleFileUpload} />
        </div>
        
        <div className="files-section">
          <FileList 
            refreshTrigger={refreshFiles} 
            onFileDelete={handleFileDelete} 
          />
        </div>
      </main>
    </div>
  );
}

export default App;