import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import { upload } from '../config/multer';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Apply authentication
router.use(authenticate);

// Upload single file to GridFS
router.post('/single', upload.single('file'), (req: Request, res: Response): void => {
  try {
    if (!req.file) {
      res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
      return;
    }

    // File is now stored in MongoDB GridFS
    const fileData = req.file as any;

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully to MongoDB',
      data: {
        fileId: fileData.id,
        filename: fileData.filename,
        originalName: fileData.originalname,
        mimetype: fileData.mimetype,
        size: fileData.size,
        url: `/api/upload/file/${fileData.id}` // URL to retrieve file
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

// Upload multiple files to GridFS
router.post('/multiple', upload.array('files', 5), (req: Request, res: Response): void => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      res.status(400).json({ 
        success: false, 
        message: 'No files uploaded' 
      });
      return;
    }

    const uploadedFiles = (req.files as any[]).map(file => ({
      fileId: file.id,
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: `/api/upload/file/${file.id}`
    }));

    res.status(200).json({
      success: true,
      message: `${uploadedFiles.length} file(s) uploaded successfully to MongoDB`,
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

// Retrieve file from GridFS
router.get('/file/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.id);
    
    // Initialize GridFS bucket
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'uploads'
    });

    // Find file metadata
    const files = await bucket.find({ _id: fileId }).toArray();
    
    if (!files || files.length === 0) {
      res.status(404).json({ 
        success: false, 
        message: 'File not found' 
      });
      return;
    }

    const file = files[0];

    // Set proper content type
    res.set('Content-Type', file.contentType || 'application/octet-stream');
    res.set('Content-Disposition', `inline; filename="${file.filename}"`);

    // Stream file from GridFS
    const downloadStream = bucket.openDownloadStream(fileId);
    downloadStream.pipe(res);

  } catch (error) {
    console.error('File retrieval error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve file' 
    });
  }
});

// Delete file from GridFS
router.delete('/file/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.id);
    
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'uploads'
    });

    await bucket.delete(fileId);

    res.status(200).json({
      success: true,
      message: 'File deleted successfully from MongoDB'
    });

  } catch (error) {
    console.error('File deletion error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete file' 
    });
  }
});

export default router;