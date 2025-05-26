// backend/routes/files.js
import express from 'express';
import multer from 'multer';
import auth from '../middleware/auth.js';
import { uploadFile, generateSasUrl } from '../services/azureStorage.js';

const router = express.Router();

// Configure multer for memory storage (not disk)
const storage = multer.memoryStorage();

// File filter to limit file types
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Unsupported file type'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Route to handle file uploads
router.post('/upload', auth, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const fileBuffer = req.file.buffer;
        const fileName = req.file.originalname;
        const fileType = req.file.mimetype;

        // Upload to Azure Blob Storage
        const blobName = await uploadFile(fileBuffer, fileName, fileType);

        // Return file data without generating SAS URL yet
        res.status(200).json({
            file: {
                name: fileName,
                type: fileType,
                blobName: blobName,
                size: req.file.size
            }
        });
    } catch (error) {
        console.error('File upload error:', error);
        return res.status(500).json({ error: 'File upload failed' });
    }
});

// Route to get a new SAS URL for an expired one
router.get('/download/:blobName', auth, async (req, res) => {
    try {
        const { blobName } = req.params;
        const url = await generateSasUrl(blobName);

        return res.status(200).json({ url });
    } catch (error) {
        console.error('File download error:', error);
        return res.status(500).json({ error: 'Failed to generate download URL' });
    }
});

router.get('/view/:blobName', auth, async (req, res) => {
    try {
        const { blobName } = req.params;
        const url = await generateSasUrl(blobName);

        return res.status(200).json({ url });
    } catch (error) {
        console.error('File view error:', error);
        return res.status(500).json({ error: 'Failed to generate view URL' });
    }
});

export default router;
