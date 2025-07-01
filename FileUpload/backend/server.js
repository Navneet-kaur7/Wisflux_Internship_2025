const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Function to sanitize filename
const sanitizeFilename = (filename) => {
    // Remove or replace dangerous characters
    return filename
        .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars with underscore
        .replace(/_{2,}/g, '_') // Replace multiple underscores with single
        .replace(/^_+|_+$/g, ''); // Remove leading/trailing underscores
};

// Function to handle duplicate filenames
const getUniqueFilename = (filename) => {
    const ext = path.extname(filename);
    const nameWithoutExt = path.basename(filename, ext);
    let counter = 1;
    let newFilename = filename;

    // Check if file exists and increment counter
    while (fs.existsSync(path.join(uploadDir, newFilename))) {
        newFilename = `${nameWithoutExt}(${counter})${ext}`;
        counter++;
    }

    return newFilename;
};

// Multer configuration for file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Option 1: Keep original name with conflict handling
        const sanitizedName = sanitizeFilename(file.originalname);
        const uniqueName = getUniqueFilename(sanitizedName);
        cb(null, uniqueName);
        
        // Option 2: Prefix with timestamp but keep original name
        // const timestampedName = Date.now() + '_' + sanitizeFilename(file.originalname);
        // cb(null, timestampedName);
        
        // Option 3: Use original name exactly (risky - can cause overwrites)
        // cb(null, file.originalname);
    }
});

// File filter for allowed file types
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|txt|docx|doc/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only images, PDFs, and documents are allowed!'));
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: fileFilter
});

// Routes

// Single file upload
app.post('/api/upload/single', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        res.json({
            message: 'File uploaded successfully',
            file: {
                filename: req.file.filename,
                originalname: req.file.originalname,
                size: req.file.size,
                mimetype: req.file.mimetype,
                path: req.file.path
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Multiple files upload
app.post('/api/upload/multiple', upload.array('files', 5), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        const files = req.files.map(file => ({
            filename: file.filename,
            originalname: file.originalname,
            size: file.size,
            mimetype: file.mimetype,
            path: file.path
        }));

        res.json({
            message: 'Files uploaded successfully',
            files: files
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all uploaded files
app.get('/api/files', (req, res) => {
    try {
        fs.readdir('uploads', (err, files) => {
            if (err) {
                return res.status(500).json({ error: 'Unable to read files' });
            }

            const fileList = files.map(filename => {
                const filePath = path.join('uploads', filename);
                const stats = fs.statSync(filePath);
                return {
                    filename,
                    size: stats.size,
                    uploadDate: stats.birthtime
                };
            });

            res.json({ files: fileList });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Delete file
app.delete('/api/files/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join('uploads', filename);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            res.json({ message: 'File deleted successfully' });
        } else {
            res.status(404).json({ error: 'File not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large' });
        }
    }
    res.status(500).json({ error: error.message });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});