// Upload file function
async function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    const progressDiv = document.getElementById('uploadProgress');
    
    if (fileInput.files.length === 0) {
        alert('Please select a file');
        return;
    }
    
    for (let file of fileInput.files) {
        try {
            progressDiv.innerHTML = `Uploading ${file.name}...`;
            
            // Get pre-signed URL
            const response = await fetch('/api/files/upload-url', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fileName: file.name,
                    fileType: file.type
                })
            });
            
            const { uploadUrl, downloadUrl } = await response.json();
            
            // Upload file directly to S3
            const uploadResponse = await fetch(uploadUrl, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': file.type
                }
            });
            
            if (uploadResponse.ok) {
                progressDiv.innerHTML += `<br>✅ ${file.name} uploaded successfully!`;
                progressDiv.innerHTML += `<br>📁 <a href="${downloadUrl}" target="_blank">View File</a>`;
            } else {
                throw new Error('Upload failed');
            }
        } catch (error) {
            progressDiv.innerHTML += `<br>❌ Error uploading ${file.name}: ${error.message}`;
        }
    }
    
    // Refresh file list
    setTimeout(loadFiles, 1000);
}

// Load files function
async function loadFiles() {
    const filesList = document.getElementById('filesList');
    
    try {
        const response = await fetch('/api/files/list');
        const { files } = await response.json();
        
        if (files.length === 0) {
            filesList.innerHTML = '<p>No files uploaded yet.</p>';
            return;
        }
        
        filesList.innerHTML = files.map(file => `
            <div class="file-item">
                <div class="file-info">
                    <strong>${file.name}</strong>
                    <small>${formatFileSize(file.size)} - ${new Date(file.lastModified).toLocaleString()}</small>
                </div>
                <div class="file-actions">
                    <button onclick="downloadFile('${file.key}')">Download</button>
                    <button onclick="deleteFile('${file.key}')" class="delete-btn">Delete</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        filesList.innerHTML = '<p>Error loading files.</p>';
        console.error('Error loading files:', error);
    }
}

// Download file function
async function downloadFile(key) {
    try {
        const response = await fetch(`/api/files/download-url/${key}`);
        const { downloadUrl } = await response.json();
        
        // Open download URL in new tab
        window.open(downloadUrl, '_blank');
    } catch (error) {
        alert('Error downloading file');
        console.error('Error downloading file:', error);
    }
}

// Delete file function
async function deleteFile(key) {
    if (!confirm('Are you sure you want to delete this file?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/files/${key}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('File deleted successfully');
            loadFiles(); // Refresh list
        } else {
            throw new Error('Delete failed');
        }
    } catch (error) {
        alert('Error deleting file');
        console.error('Error deleting file:', error);
    }
}

// Utility function to format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Load files on page load
document.addEventListener('DOMContentLoaded', loadFiles);