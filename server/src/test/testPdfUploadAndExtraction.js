import crypto from 'crypto';
import mongoose from 'mongoose';
import { PdfExtractionService } from '../services/pdfExtractionService.js';
import { ResumeService } from '../services/resumeService.js';
import { ResumeDocument } from '../models/ResumeDocument.js';
import { 
  verifyPdfMagicBytes, 
  sanitizeFileName, 
  validateUploadedPdf,
  MAX_RESUME_FILE_SIZE,
  PDF_MAGIC_BYTES 
} from '../middleware/uploadMiddleware.js';
import { AuthService } from '../services/authService.js';
import { AppError } from '../utils/AppError.js';

console.log('🧪 Starting Tekmira AI Resume Upload & PDF Text Extraction Tests (Day 10)...\n');

let passed = 0;
let failed = 0;

function assert(description, condition) {
  if (condition) {
    console.log(`✅ PASS: ${description}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${description}`);
    failed++;
  }
}

/**
 * Deterministically constructs a real, syntactically valid PDF binary buffer
 * containing selectable text operators (BT, Tf, Td, Tj, ET).
 */
function createValidPdfBuffer(lines = ['Candidate Name: Alex Morgan', 'Skills: React, Node.js, PostgreSQL']) {
  const contentStream = 'BT\n/F1 12 Tf\n72 712 Td\n' + 
    lines.map((l, i) => (i === 0 ? '(' + l + ') Tj' : '0 -18 Td\n(' + l + ') Tj')).join('\n') + 
    '\nET';
  const streamLen = Buffer.byteLength(contentStream);
  
  let pdf = '%PDF-1.4\n';
  const offsets = [];
  
  // Obj 1: Catalog
  offsets.push(Buffer.byteLength(pdf));
  pdf += '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
  
  // Obj 2: Pages
  offsets.push(Buffer.byteLength(pdf));
  pdf += '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n';
  
  // Obj 3: Page
  offsets.push(Buffer.byteLength(pdf));
  pdf += '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /Contents 4 0 R >>\nendobj\n';
  
  // Obj 4: Contents Stream
  offsets.push(Buffer.byteLength(pdf));
  pdf += '4 0 obj\n<< /Length ' + streamLen + ' >>\nstream\n' + contentStream + '\nendstream\nendobj\n';
  
  // XRef Table
  const xrefOffset = Buffer.byteLength(pdf);
  pdf += 'xref\n0 5\n0000000000 65535 f \n';
  for (let offset of offsets) {
    pdf += String(offset).padStart(10, '0') + ' 00000 n \n';
  }
  pdf += 'trailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n' + xrefOffset + '\n%%EOF';
  return Buffer.from(pdf, 'binary');
}

/**
 * Constructs a syntactically valid PDF without any text content stream
 * (simulating an image-only / scanned document or blank page).
 */
function createEmptyScannedPdfBuffer() {
  const contentStream = '% No text operators, blank raster placeholder';
  const streamLen = Buffer.byteLength(contentStream);
  
  let pdf = '%PDF-1.4\n';
  const offsets = [];
  
  offsets.push(Buffer.byteLength(pdf));
  pdf += '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
  
  offsets.push(Buffer.byteLength(pdf));
  pdf += '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n';
  
  offsets.push(Buffer.byteLength(pdf));
  pdf += '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n';
  
  offsets.push(Buffer.byteLength(pdf));
  pdf += '4 0 obj\n<< /Length ' + streamLen + ' >>\nstream\n' + contentStream + '\nendstream\nendobj\n';
  
  const xrefOffset = Buffer.byteLength(pdf);
  pdf += 'xref\n0 5\n0000000000 65535 f \n';
  for (let offset of offsets) {
    pdf += String(offset).padStart(10, '0') + ' 00000 n \n';
  }
  pdf += 'trailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n' + xrefOffset + '\n%%EOF';
  return Buffer.from(pdf, 'binary');
}

async function runTests() {
  // =========================================================================
  // 1. PDF Magic Bytes & Binary Security Verification
  // =========================================================================
  console.log('--- 1. PDF Magic Bytes & File Signature Verification ---');
  
  const validBuffer = createValidPdfBuffer();
  assert('Valid PDF buffer starts with %PDF-', verifyPdfMagicBytes(validBuffer));
  assert('Magic byte constant is defined as %PDF-', PDF_MAGIC_BYTES === '%PDF-');

  // ZIP / DOCX magic bytes: PK\x03\x04
  const zipBuffer = Buffer.from([0x50, 0x4B, 0x03, 0x04, 0x14, 0x00]);
  assert('Rejects ZIP/DOCX magic bytes (PK\\x03\\x04) even if named .pdf', !verifyPdfMagicBytes(zipBuffer));

  // Linux ELF Executable: \x7fELF
  const elfBuffer = Buffer.from([0x7F, 0x45, 0x4C, 0x46, 0x02, 0x01]);
  assert('Rejects Linux ELF executable header', !verifyPdfMagicBytes(elfBuffer));

  // Windows PE Executable: MZ
  const exeBuffer = Buffer.from([0x4D, 0x5A, 0x90, 0x00, 0x03, 0x00]);
  assert('Rejects Windows PE executable header (MZ)', !verifyPdfMagicBytes(exeBuffer));

  // Plain text file renamed to .pdf
  const textBuffer = Buffer.from('Just plain text without PDF header');
  assert('Rejects plain text file renamed with .pdf extension', !verifyPdfMagicBytes(textBuffer));

  // =========================================================================
  // 2. Safe Filename Sanitization & Directory Traversal Prevention
  // =========================================================================
  console.log('\n--- 2. Safe Filename Sanitization & Path Traversal Prevention ---');
  
  assert('Sanitizes Unix path traversal attempt', 
    sanitizeFileName('../../../etc/passwd.pdf') === 'passwd.pdf');
  assert('Sanitizes Windows path traversal attempt', 
    sanitizeFileName('..\\..\\Windows\\System32\\cmd.exe.pdf') === 'cmd.exe.pdf');
  assert('Strips null bytes to prevent filename truncation attacks', 
    !sanitizeFileName('resume\0evil.exe.pdf').includes('\0') && 
    sanitizeFileName('resume\0evil.exe.pdf') === 'resumeevil.exe.pdf');
  assert('Replaces whitespace and special shell characters with safe underscores', 
    sanitizeFileName('My Resume (Final) [2026] & Notes.pdf') === 'My_Resume__Final___2026____Notes.pdf');
  assert('Appends .pdf extension if omitted', 
    sanitizeFileName('alex-morgan-cv').endsWith('.pdf'));

  // =========================================================================
  // 3. Upload Middleware & Limits Verification
  // =========================================================================
  console.log('\n--- 3. Upload Middleware & Limits Verification ---');
  
  assert('Maximum resume file size limit is strictly 5MB', MAX_RESUME_FILE_SIZE === 5 * 1024 * 1024);

  // Missing file in request
  let missingFileError = null;
  const mockReqEmpty = { file: null };
  validateUploadedPdf(mockReqEmpty, {}, (err) => { missingFileError = err; });
  assert('Rejects request with no uploaded file (HTTP 400)', 
    missingFileError instanceof AppError && missingFileError.statusCode === 400);

  // 0-byte empty file
  let zeroByteError = null;
  const mockReqZero = {
    file: {
      buffer: Buffer.alloc(0),
      size: 0,
      originalname: 'empty.pdf'
    }
  };
  validateUploadedPdf(mockReqZero, {}, (err) => { zeroByteError = err; });
  assert('Rejects 0-byte empty file with HTTP 400', 
    zeroByteError instanceof AppError && zeroByteError.statusCode === 400);

  // Invalid signature in .pdf file
  let invalidSignatureError = null;
  const mockReqSpoofed = {
    file: {
      buffer: Buffer.from('Renamed malicious payload'),
      size: 25,
      originalname: 'malware.pdf'
    }
  };
  validateUploadedPdf(mockReqSpoofed, {}, (err) => { invalidSignatureError = err; });
  assert('Rejects file with invalid header signature with HTTP 400', 
    invalidSignatureError instanceof AppError && invalidSignatureError.statusCode === 400);

  // Valid file attaches SHA-256 and sanitized filename
  let validNextCalled = false;
  const expectedHash = crypto.createHash('sha256').update(validBuffer).digest('hex');
  const mockReqValid = {
    file: {
      buffer: validBuffer,
      size: validBuffer.length,
      originalname: '../../Alex Resume.pdf'
    }
  };
  validateUploadedPdf(mockReqValid, {}, (err) => {
    if (!err) validNextCalled = true;
  });
  assert('Valid PDF file passes middleware without error', validNextCalled);
  assert('Computes accurate SHA-256 cryptographic fingerprint', mockReqValid.file.sha256Hash === expectedHash);
  assert('Attaches sanitized filename', mockReqValid.file.sanitizedName === 'Alex_Resume.pdf');

  // =========================================================================
  // 4. PDF Text Extraction Engine (PdfExtractionService)
  // =========================================================================
  console.log('\n--- 4. PDF Text Extraction Engine (PdfExtractionService) ---');
  
  const extracted = await PdfExtractionService.extractText(validBuffer);
  assert('Extracts non-empty text stream from PDF buffer', typeof extracted.text === 'string' && extracted.text.length > 0);
  assert('Extracted text contains candidate name', extracted.text.includes('Alex Morgan'));
  assert('Extracted text contains skills', extracted.text.includes('React') && extracted.text.includes('Node.js'));
  assert('Reports correct page count of 1', extracted.pageCount === 1);
  assert('Calculates non-zero word count', extracted.wordCount > 5);
  assert('Correctly flags digital text PDF as isScanned = false', extracted.isScanned === false);
  assert('Provides clean text preview', typeof extracted.preview === 'string' && extracted.preview.length > 0);

  // Normalization logic test
  const dirtyText = 'Line 1\r\nLine 2\r\n\r\n\r\n\r\nLine 3\0 with   spaces';
  const normalized = PdfExtractionService.normalizeExtractedText(dirtyText);
  assert('Normalizes CRLF into standard newlines', !normalized.includes('\r\n'));
  assert('Strips null bytes from text', !normalized.includes('\0'));
  assert('Caps excessive consecutive linebreaks to maximum 2', !normalized.includes('\n\n\n'));

  // Corrupt PDF structure error handling
  let corruptError = null;
  try {
    const corruptBuffer = Buffer.from('%PDF-1.4\nCORRUPT_TRAILER_AND_INVALID_STREAM%%EOF');
    await PdfExtractionService.extractText(corruptBuffer);
  } catch (err) {
    corruptError = err;
  }
  assert('Handles malformed PDF structure with defensive HTTP 400 AppError', 
    corruptError instanceof AppError && corruptError.statusCode === 400);

  // =========================================================================
  // 5. Scanned / Image-Only PDF Detection & Honest OCR Notice
  // =========================================================================
  console.log('\n--- 5. Scanned / Image-Only PDF Detection & Zero-OCR Honesty ---');
  
  const emptyPdfBuffer = createEmptyScannedPdfBuffer();
  const scannedResult = await PdfExtractionService.extractText(emptyPdfBuffer);
  assert('Detects image-based/scanned PDF (isScanned = true)', scannedResult.isScanned === true);
  assert('Includes clear warning explaining lack of OCR for scanned documents', 
    scannedResult.warning && scannedResult.warning.includes('OCR'));

  // =========================================================================
  // 6. ResumeService Persistence & User Association
  // =========================================================================
  console.log('\n--- 6. ResumeService Persistence & User Association ---');
  
  const mockFile = {
    buffer: validBuffer,
    originalname: 'john_doe_resume.pdf',
    sanitizedName: 'john_doe_resume.pdf',
    size: validBuffer.length,
    mimetype: 'application/pdf',
    sha256Hash: expectedHash
  };

  // Case A: Authenticated Candidate
  const candidateId = 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
  const storedAuthDoc = await ResumeService.processAndStorePdf(mockFile, candidateId, { allowScanned: false });
  assert('Stored document associates with authenticated candidate user UUID', storedAuthDoc.userId === candidateId);
  assert('Stored document records original sanitized filename', storedAuthDoc.fileName === 'john_doe_resume.pdf');
  assert('Stored document preserves file size in bytes', storedAuthDoc.fileSize === validBuffer.length);
  assert('Stored document records page count', storedAuthDoc.pageCount === 1);
  assert('Stored document preserves SHA-256 fingerprint', storedAuthDoc.sha256Hash === expectedHash);
  assert('Stored document records isScanned as false', storedAuthDoc.isScanned === false);

  // Case B: Unauthenticated / Demo Candidate (Guest Fallback)
  const storedGuestDoc = await ResumeService.processAndStorePdf(mockFile, null, { allowScanned: false });
  assert('Unauthenticated upload falls back safely to guest user ID without crashing', 
    storedGuestDoc.userId === '00000000-0000-0000-0000-000000000000');

  // Case C: Rejection of Scanned PDF when allowScanned is false
  let scannedRejection = null;
  const mockScannedFile = {
    buffer: emptyPdfBuffer,
    originalname: 'scanned_scan.pdf',
    sanitizedName: 'scanned_scan.pdf',
    size: emptyPdfBuffer.length,
    mimetype: 'application/pdf'
  };
  try {
    await ResumeService.processAndStorePdf(mockScannedFile, candidateId, { allowScanned: false });
  } catch (err) {
    scannedRejection = err;
  }
  assert('Rejects scanned/image-only PDF with HTTP 422 Unprocessable Entity', 
    scannedRejection instanceof AppError && scannedRejection.statusCode === 422);

  // =========================================================================
  // 7. Strictly Authenticated Endpoint Security (Auth Guards)
  // =========================================================================
  console.log('\n--- 7. Authenticated Route & JWT Guard Security ---');
  
  // Create valid student token
  const testStudent = {
    id: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
    email: 'alex@example.com',
    role: 'STUDENT'
  };
  const validToken = AuthService.generateToken(testStudent);
  const decoded = AuthService.verifyToken(validToken);
  assert('Generated test JWT decodes candidate identity correctly', decoded.id === testStudent.id);

  // Test tampered token rejection
  let tamperedTokenError = null;
  try {
    AuthService.verifyToken(validToken + 'tampered');
  } catch (err) {
    tamperedTokenError = err;
  }
  assert('Tampered bearer token is strictly rejected (HTTP 401)', 
    tamperedTokenError instanceof AppError && tamperedTokenError.statusCode === 401);

  // =========================================================================
  // 8. MongoDB ResumeDocument Mongoose Schema Compliance
  // =========================================================================
  console.log('\n--- 8. MongoDB ResumeDocument Schema Compliance ---');
  
  const testDoc = new ResumeDocument({
    userId: candidateId,
    fileName: 'alex_verified.pdf',
    fileSize: validBuffer.length,
    mimeType: 'application/pdf',
    rawText: extracted.text,
    pageCount: extracted.pageCount,
    wordCount: extracted.wordCount,
    sha256Hash: expectedHash,
    isScanned: false
  });

  const validationError = testDoc.validateSync();
  assert('ResumeDocument schema validates successfully with new metadata fields', !validationError);
  assert('ResumeDocument preserves pageCount field', testDoc.pageCount === 1);
  assert('ResumeDocument preserves wordCount field', testDoc.wordCount > 0);
  assert('ResumeDocument preserves sha256Hash field', testDoc.sha256Hash === expectedHash);
  assert('ResumeDocument preserves isScanned boolean', testDoc.isScanned === false);

  // =========================================================================
  // Summary
  // =========================================================================
  console.log('\n===============================================');
  console.log(`📊 Test Summary: ${passed} passed, ${failed} failed`);
  console.log('===============================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Unhandled test execution error:', err);
  process.exit(1);
});
