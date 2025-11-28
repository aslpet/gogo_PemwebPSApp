import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import Grid from 'gridfs-stream';
import { upload } from '../config/multer';
import { authenticate } from '../middleware/auth';
import { Readable } from 'stream';

const router = express.Router();

// Initialize GridFS - declare as potentially undefined
let gfs: Grid.Grid | undefined;

mongoose.connection.once('open', () => {
  // Ensure db exists before creating Grid instance
  if (mongoose.connection.db) {
    gfs = Grid(mongoose.connection.db, mongoose.mongo);
    gfs.collection('uploads');
  } else {
    console.error('❌ MongoDB database not available for GridFS');
  }
});

// Apply authentication
router.use(authenticate);

// Upload single file to GridFS using Multer v2
router.post('/single', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if GridFS is initialized
    if (!gfs) {
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
    const readableStream = new Readable();
    readableStream.push(req.file.buffer);
    readableStream.push(null);

    // Generate unique filename
    const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${getFileExtension(req.file.originalname)}`;

    // Create GridFS write stream
    const writestream = gfs.createWriteStream({
      filename: filename,
      content_type: req.file.mimetype,
      metadata: {
        originalName: req.file.originalname,
        uploadDate: new Date()
      }
    });

    // Pipe the file buffer to GridFS
    readableStream.pipe(writestream);

    writestream.on('close', (file: any) => {
      res.status(200).json({
        success: true,
        message: 'File uploaded successfully to MongoDB',
        data: {
          fileId: file._id,
          filename: file.filename,
          originalName: req.file!.originalname,
          mimetype: req.file!.mimetype,
          size: req.file!.size,
          url: `/api/upload/file/${file._id}`
        }
      });
    });

    writestream.on('error', (error: any) => {
      console.error('GridFS write error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to upload file to GridFS' 
      });
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
router.post('/multiple', upload.array('files', 5), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!gfs) {
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
      return new Promise((resolve, reject) => {
        if (!gfs) {
          reject(new Error('GridFS not initialized'));
          return;
        }

        const readableStream = new Readable();
        readableStream.push(file.buffer);
        readableStream.push(null);

        const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${getFileExtension(file.originalname)}`;

        const writestream = gfs.createWriteStream({
          filename: filename,
          content_type: file.mimetype,
          metadata: {
            originalName: file.originalname,
            uploadDate: new Date()
          }
        });

        readableStream.pipe(writestream);

        writestream.on('close', (gridFile: any) => {
          resolve({
            fileId: gridFile._id,
            filename: gridFile.filename,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            url: `/api/upload/file/${gridFile._id}`
          });
        });

        writestream.on('error', reject);
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
    if (!gfs) {
      res.status(503).json({ 
        success: false, 
        message: 'File storage system not initialized.' 
      });
      return;
    }

    const fileId = new mongoose.Types.ObjectId(req.params.id);

    // Find file metadata
    gfs.files.findOne({ _id: fileId }, (err: any, file: any) => {
      if (err || !file) {
        res.status(404).json({ 
          success: false, 
          message: 'File not found' 
        });
        return;
      }

      // Set proper content type
      res.set('Content-Type', file.contentType || 'application/octet-stream');
      res.set('Content-Disposition', `inline; filename="${file.filename}"`);

      // Stream file from GridFS
      if (!gfs) {
        res.status(503).json({ 
          success: false, 
          message: 'File storage system not initialized.' 
        });
        return;
      }

      const readstream = gfs.createReadStream({
        _id: fileId
      });

      readstream.on('error', (error: any) => {
        console.error('GridFS read error:', error);
        res.status(500).json({ 
          success: false, 
          message: 'Failed to retrieve file' 
        });
      });

      readstream.pipe(res);
    });

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
    if (!gfs) {
      res.status(503).json({ 
        success: false, 
        message: 'File storage system not initialized.' 
      });
      return;
    }

    const fileId = new mongoose.Types.ObjectId(req.params.id);

    gfs.remove({ _id: fileId }, (err: any) => {
      if (err) {
        console.error('GridFS delete error:', err);
        res.status(500).json({ 
          success: false, 
          message: 'Failed to delete file' 
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'File deleted successfully from MongoDB'
      });
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