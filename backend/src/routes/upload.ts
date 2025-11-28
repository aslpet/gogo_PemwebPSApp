import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';
import { upload } from '../config/multer';
import { authenticate } from '../middleware/auth';
import { Readable } from 'stream';

const router = express.Router();

// Initialize GridFSBucket - will be set after MongoDB connection
let bucket: GridFSBucket | null = null;

mongoose.connection.once('open', () => {
  if (mongoose.connection.db) {
    bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: 'uploads'
    });
    console.log('✅ GridFSBucket initialized successfully');
  } else {
    console.error('❌ MongoDB database not available for GridFS');
  }
});

// Apply authentication
router.use(authenticate);

// Upload single file to GridFS using Multer v2
router.post('/single', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!bucket) {
      res.status(503).json({ 
        success: false, 
        message: 'File storage system not initialized. Please try again later.' 
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
      return;
    }

    // Create a readable stream from the buffer
    const readableStream = Readable.from(req.file.buffer);

    // Generate unique filename
    const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${getFileExtension(req.file.originalname)}`;

    // Create upload stream
    const uploadStream = bucket.openUploadStream(filename, {
      contentType: req.file.mimetype,
      metadata: {
        originalName: req.file.originalname,
        uploadDate: new Date()
      }
    });

    // Handle upload completion
    uploadStream.on('finish', () => {
      res.status(200).json({
        success: true,
        message: 'File uploaded successfully to MongoDB',
        data: {
          fileId: uploadStream.id.toString(),
          filename: filename,
          originalName: req.file!.originalname,
          mimetype: req.file!.mimetype,
          size: req.file!.size,
          url: `/api/upload/file/${uploadStream.id}`
        }
      });
    });

    uploadStream.on('error', (error: any) => {
      console.error('GridFS upload error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to upload file to GridFS' 
      });
    });

    // Pipe the file buffer to GridFS
    readableStream.pipe(uploadStream);

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'File upload failed' 
    });
  }
});

// Upload multiple files to GridFS
router.post('/multiple', upload.array('files', 5), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!bucket) {
      res.status(503).json({ 
        success: false, 
        message: 'File storage system not initialized. Please try again later.' 
      });
      return;
    }

    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      res.status(400).json({ 
        success: false, 
        message: 'No files uploaded' 
      });
      return;
    }

    const uploadPromises = req.files.map((file: Express.Multer.File) => {
      return new Promise<any>((resolve, reject) => {
        const readableStream = Readable.from(file.buffer);
        const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${getFileExtension(file.originalname)}`;

        const uploadStream = bucket!.openUploadStream(filename, {
          contentType: file.mimetype,
          metadata: {
            originalName: file.originalname,
            uploadDate: new Date()
          }
        });

        uploadStream.on('finish', () => {
          resolve({
            fileId: uploadStream.id.toString(),
            filename: filename,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            url: `/api/upload/file/${uploadStream.id}`
          });
        });

        uploadStream.on('error', reject);

        readableStream.pipe(uploadStream);
      });
    });

    const uploadedFiles = await Promise.all(uploadPromises);

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
    if (!bucket) {
      res.status(503).json({ 
        success: false, 
        message: 'File storage system not initialized.' 
      });
      return;
    }

    const fileId = new mongoose.Types.ObjectId(req.params.id);

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

    downloadStream.on('error', (error: any) => {
      console.error('GridFS read error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to retrieve file' 
      });
    });

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
    if (!bucket) {
      res.status(503).json({ 
        success: false, 
        message: 'File storage system not initialized.' 
      });
      return;
    }

    const fileId = new mongoose.Types.ObjectId(req.params.id);

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

// Helper function to get file extension
function getFileExtension(filename: string): string {
  const ext = filename.split('.').pop();
  return ext ? `.${ext}` : '';
}

export default router;