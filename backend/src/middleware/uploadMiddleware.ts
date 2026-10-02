import multer from 'multer';

const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = [
  // Images
  'image/jpeg',
  'image/png',
  'image/webp',
  // Text / Chat
  'text/plain',
  'text/csv',
  'application/json',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid evidence type. ${file.mimetype} is not supported. Supported: JPG, PNG, WEBP, TXT, CSV, JSON.`));
    }
  },
});
