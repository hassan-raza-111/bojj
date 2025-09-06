import multer from 'multer';
import path from 'path';
import { Request } from 'express';

// Configure storage
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    let uploadPath = '';
    
    if (file.fieldname === 'profilePicture') {
      uploadPath = path.join(__dirname, '../../uploads/profiles');
    } else if (file.fieldname === 'portfolioImages') {
      uploadPath = path.join(__dirname, '../../uploads/portfolio');
    } else {
      uploadPath = path.join(__dirname, '../../uploads');
    }
    
    cb(null, uploadPath);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const filename = `${file.fieldname}-${uniqueSuffix}${extension}`;
    cb(null, filename);
  }
});

// File filter for images only
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Middleware for single profile picture upload
export const uploadProfilePicture = upload.single('profilePicture');

// Middleware for multiple portfolio images upload
export const uploadPortfolioImages = upload.array('portfolioImages', 10); // Max 10 images

// Middleware for any single image upload
export const uploadSingleImage = upload.single('image');

export default upload;
