import { PDFParse } from 'pdf-parse';
import { AppError } from '../utils/AppError.js';

/**
 * PDF Text Extraction Service
 * Extracts plain text streams, page counts, word counts, and structural metadata from PDF buffers.
 * Detects scanned/image-only PDFs and encrypted documents.
 */
export class PdfExtractionService {
  /**
   * Minimum non-whitespace character count to consider a document text-based
   */
  static MIN_TEXT_CHARS = 20;

  /**
   * Extract textual content and metadata from a raw PDF buffer
   * @param {Buffer} pdfBuffer - Raw in-memory binary buffer
   * @param {Object} options - Optional extraction configurations
   * @returns {Promise<Object>} Extracted text, page metrics, and scan indicators
   */
  static async extractText(pdfBuffer, options = {}) {
    if (!Buffer.isBuffer(pdfBuffer) || pdfBuffer.length === 0) {
      throw new AppError('A non-empty PDF binary buffer is required for text extraction', 400);
    }

    try {
      const parser = new PDFParse({ data: pdfBuffer });
      const parsedData = await parser.getText();

      const rawContent = parsedData.text || '';
      
      // Clean and normalize the extracted text stream
      const sanitizedText = this.normalizeExtractedText(rawContent);
      const characterCount = sanitizedText.length;
      const nonWhitespaceCount = sanitizedText.replace(/\s+/g, '').length;
      
      const wordCount = sanitizedText.length > 0 
        ? sanitizedText.split(/\s+/).filter(Boolean).length 
        : 0;

      const pageCount = Number.isInteger(parsedData.total) && parsedData.total > 0 
        ? parsedData.total 
        : (parsedData.pages?.length || 1);

      // Detect if this document is scanned or image-only
      const isScanned = nonWhitespaceCount < this.MIN_TEXT_CHARS;

      let warning = null;
      if (isScanned) {
        warning = 'No selectable text stream detected in this PDF. It appears to be an image-based, flat scanned document, or an empty template. Tekmira AI requires digital, selectable text PDFs (e.g. exported from Microsoft Word, Google Docs, or LaTeX); OCR for scanned photographs is not supported.';
      }

      return {
        text: sanitizedText,
        pageCount,
        wordCount,
        characterCount,
        isScanned,
        warning,
        preview: sanitizedText.slice(0, 300) + (sanitizedText.length > 300 ? '...' : '')
      };
    } catch (error) {
      // Handle password protection or encrypted streams
      if (
        error.name === 'PasswordException' || 
        error.message?.toLowerCase().includes('password') ||
        error.message?.toLowerCase().includes('encrypted')
      ) {
        throw new AppError('The uploaded PDF is password-protected or encrypted. Please remove encryption and upload an unprotected PDF.', 400);
      }

      // Handle corrupt or truncated PDF structures
      if (
        error.name === 'InvalidPDFException' ||
        error.name === 'FormatError' ||
        error.message?.toLowerCase().includes('invalid pdf') ||
        error.message?.toLowerCase().includes('stream')
      ) {
        throw new AppError('Corrupt or malformed PDF structure. Unable to parse text stream from this file.', 400);
      }

      // Re-throw if already an AppError
      if (error instanceof AppError) {
        throw error;
      }

      // General PDF parser exception
      throw new AppError(`Failed to extract text from PDF: ${error.message}`, 400);
    }
  }

  /**
   * Normalizes raw extracted PDF text
   * Strips null bytes, reconciles carriage returns, and consolidates excessive whitespace
   * @param {string} text 
   * @returns {string} Clean normalized text
   */
  static normalizeExtractedText(text) {
    if (!text || typeof text !== 'string') return '';

    return text
      .replace(/\0/g, '')                      // Strip null bytes
      .replace(/\r\n/g, '\n')                  // Standardize newlines
      .replace(/\r/g, '\n')
      .replace(/[ \t]+/g, ' ')                 // Consolidate multiple horizontal spaces
      .replace(/\n{3,}/g, '\n\n')              // Cap consecutive newlines at 2
      .trim();
  }
}

export default PdfExtractionService;
