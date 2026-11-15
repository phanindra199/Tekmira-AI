import multer from 'multer';
import crypto from 'crypto';
import path from 'path';
import { AppError } from '../utils/AppError.js';

// Maximum allowed resume file size: 5 Megabytes
export const MAX_RESUME_FILE_SIZE = 5 * 1024 * 1024; // 5,242,880 bytes

// Allowed MIME types and extensions
export const ALLOWED_MIME_TYPES = ['application/pdf'];
export const ALLOWED_EXTENSIONS = ['.pdf'];

// PDF Magic Byte specification: Must begin with %PDF- (0x25 0x50 0x44 0x46 0x2D)
export const PDF_MAGIC_BYTES = '%PDF-';

/**
 * Configure Multer Memory Storage
 * Using memory storage avoids persisting unvetted, potentially malicious bytes to the disk,
 * eliminates filesystem race conditions, and allows direct buffer streaming to the PDF parser.
 */
const storage = multer.memoryStorage();

/**
 * MIME Type & Extension Filter
 * Initial perimeter check; secondary validation is performed on raw buffer magic bytes.
 */
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(
      new AppError(
        `Invalid file extension '${ext}'. Only standard PDF documents (.pdf) are permitted.`, 
        400
      ), 
      false
    );
  }

  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(
      new AppError(
        `Invalid MIME type '${file.mimetype}'. Only 'application/pdf' files are accepted.`, 
        400
      ), 
      false
    );
  }

  cb(null, true);
};

// Initialize Multer upload instance
const upload = multer({
  storage,
  limits: {
    fileSize: MAX_RESUME_FILE_SIZE,
    files: 1 // Strictly allow only 1 file per upload request
  },
  fileFilter
});

/**
 * Sanitizes candidate-supplied filenames to prevent path traversal and null byte injection
 * @param {string} originalName 
 * @returns {string} Sanitized filename
 */
export function sanitizeFileName(originalName) {
  if (!originalName || typeof originalName !== 'string') {
    return `resume-${Date.now()}.pdf`;
  }

  // Strip path separators, null bytes, and non-whitelisted characters
  const baseName = path.basename(originalName)
    .replace(/\0/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_');

  // Ensure file ends with .pdf
  if (!baseName.toLowerCase().endsWith('.pdf')) {
    return `${baseName}.pdf`;
  }

  return baseName || `resume-${Date.now()}.pdf`;
}

/**
 * Validates the raw binary buffer for the official %PDF- magic byte signature
 * @param {Buffer} buffer 
 * @returns {boolean}
 */
export function verifyPdfMagicBytes(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 5) {
    return false;
  }
  return buffer.slice(0, 5).toString('ascii') === PDF_MAGIC_BYTES;
}

/**
 * Multer execution wrapper with precise error mapping
 */
export const handleResumeUpload = (req, res, next) => {
  const singleUpload = upload.single('resume');

  singleUpload(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new AppError('File size exceeds the 5MB upload limit. Please compress or optimize your PDF.', 413));
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return next(new AppError('Unexpected form field. The resume file must be uploaded under the field name "resume".', 400));
        }
        return next(new AppError(`Upload error: ${err.message}`, 400));
      }
      return next(err);
    }
    next();
  });
};

/**
 * Deep Binary & Security Inspection Middleware
 * Enforces magic byte signatures, non-zero file sizes, safe naming, and cryptographic hashing.
 */
export const validateUploadedPdf = (req, res, next) => {
  if (!req.file) {
    return next(new AppError('No resume file provided. Please attach a PDF document using the "resume" field.', 400));
  }

  const { buffer, originalname, size } = req.file;

  // 1. Check for empty files
  if (!buffer || buffer.length === 0 || size === 0) {
    return next(new AppError('The uploaded file is empty (0 bytes). Please provide a valid resume PDF.', 400));
  }

  // 2. Validate PDF Magic Bytes (%PDF-)
  if (!verifyPdfMagicBytes(buffer)) {
    return next(new AppError(
      'Invalid file signature. The file header does not match a valid PDF document (missing %PDF- magic bytes). ' +
      'Renaming a non-PDF file to .pdf is not permitted.',
      400
    ));
  }

  // 3. Compute SHA-256 fingerprint for tamper detection and audit trail
  const hash = crypto.createHash('sha256').update(buffer).digest('hex');
  req.file.sha256Hash = hash;

  // 4. Sanitize file name
  req.file.sanitizedName = sanitizeFileName(originalname);

  next();
};

export default {
  handleResumeUpload,
  validateUploadedPdf,
  sanitizeFileName,
  verifyPdfMagicBytes,
  MAX_RESUME_FILE_SIZE
};
