import express, { Request, Response } from 'express';
import { upload } from '../config/multer';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Apply authentication
router.use(authenticate);

// Upload single file
router.post('/single', upload.single('file'), (req: Request, res: Response): void => {
  try {
    if (!req.file) {
      res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
      return;
    }

    // Generate file URL
    const fileUrl = `/uploads/${req.file.filename}`;

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: fileUrl
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'File upload failed' 
    });
  }
});

// Upload multiple files
router.post('/multiple', upload.array('files', 5), (req: Request, res: Response): void => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      res.status(400).json({ 
        success: false, 
        message: 'No files uploaded' 
      });
      return;
    }

    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: `/uploads/${file.filename}`
    }));

    res.status(200).json({
      success: true,
      message: `${uploadedFiles.length} file(s) uploaded successfully`,
      data: uploadedFiles
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'File upload failed' 
    });
  }
});

export default router;