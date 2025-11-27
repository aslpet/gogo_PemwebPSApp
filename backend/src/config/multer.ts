import multer from 'multer';
import { GridFsStorage } from 'multer-gridfs-storage';
import path from 'path';
import { Request } from 'express';

// Get MongoDB URI from environment
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gogo';

// Create GridFS storage engine
const storage = new GridFsStorage({
  url: mongoURI,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req: Request, file: Express.Multer.File) => {
    return {
      filename: `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`,
      bucketName: 'uploads' // Collection name in MongoDB
    };
  }
});

// File filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allowed file types
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, PDFs, and Office documents are allowed.'));
  }
};

// Configure multer with GridFS
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});