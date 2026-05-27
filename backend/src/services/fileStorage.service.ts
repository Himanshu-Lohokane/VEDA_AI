import { GridFSBucket, ObjectId, Db } from 'mongodb';
import { Readable } from 'stream';
import pdfParse from 'pdf-parse';

/**
 * FileStorageService handles file storage and retrieval using MongoDB GridFS
 * Supports uploading, downloading, and extracting text content from files
 */
export class FileStorageService {
  private bucket: GridFSBucket;

  /**
   * Initialize FileStorageService with MongoDB database instance
   * @param db MongoDB database instance
   */
  constructor(db: Db) {
    this.bucket = new GridFSBucket(db, { bucketName: 'uploads' });
  }

  /**
   * Upload a file to GridFS
   * @param file Multer file object containing file data
   * @returns Promise resolving to the file ID as a string
   * @throws Error if upload fails
   */
  async uploadFile(file: any): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        // Create upload stream with metadata
        const uploadStream = this.bucket.openUploadStream(file.originalname, {
          metadata: {
            originalName: file.originalname,
            mimeType: file.mimetype,
            uploadedAt: new Date(),
            size: file.size
          }
        });

        // Convert buffer to readable stream
        const readableStream = Readable.from(file.buffer);

        // Pipe file buffer to upload stream
        readableStream.pipe(uploadStream);

        // Handle successful upload
        uploadStream.on('finish', () => {
          resolve(uploadStream.id.toString());
        });

        // Handle upload errors
        uploadStream.on('error', (error) => {
          reject(new Error(`Failed to upload file: ${error.message}`));
        });

        // Handle stream errors
        readableStream.on('error', (error) => {
          reject(new Error(`Stream error during upload: ${error.message}`));
        });
      } catch (error) {
        reject(new Error(`Upload initialization failed: ${error instanceof Error ? error.message : String(error)}`));
      }
    });
  }

  /**
   * Download a file from GridFS
   * @param fileId The ObjectId of the file to download
   * @returns Promise resolving to the file buffer
   * @throws Error if file not found or download fails
   */
  async downloadFile(fileId: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        // Validate fileId format
        if (!ObjectId.isValid(fileId)) {
          reject(new Error('Invalid file ID format'));
          return;
        }

        const chunks: Buffer[] = [];
        const downloadStream = this.bucket.openDownloadStream(new ObjectId(fileId));

        // Collect chunks as they arrive
        downloadStream.on('data', (chunk: Buffer) => {
          chunks.push(chunk);
        });

        // Resolve with concatenated buffer when complete
        downloadStream.on('end', () => {
          resolve(Buffer.concat(chunks));
        });

        // Handle download errors
        downloadStream.on('error', (error) => {
          reject(new Error(`Failed to download file: ${error.message}`));
        });
      } catch (error) {
        reject(new Error(`Download initialization failed: ${error instanceof Error ? error.message : String(error)}`));
      }
    });
  }

  /**
   * Extract text content from a file (PDF or text)
   * @param fileId The ObjectId of the file to extract text from
   * @returns Promise resolving to extracted text content
   * @throws Error if extraction fails or file format is unsupported
   */
  async extractTextContent(fileId: string): Promise<string> {
    try {
      // Download the file
      const buffer = await this.downloadFile(fileId);

      // Get file metadata to determine file type
      const metadata = await this.getFileMetadata(fileId);

      if (!metadata) {
        throw new Error('File metadata not found');
      }

      const mimeType = metadata.metadata?.mimeType || '';
      const originalName = metadata.metadata?.originalName || '';

      // Handle PDF files
      if (mimeType === 'application/pdf' || originalName.toLowerCase().endsWith('.pdf')) {
        return await this.extractPdfText(buffer);
      }

      // Handle text files
      if (
        mimeType === 'text/plain' ||
        mimeType === 'text/markdown' ||
        originalName.toLowerCase().endsWith('.txt') ||
        originalName.toLowerCase().endsWith('.md')
      ) {
        return buffer.toString('utf-8');
      }

      // Unsupported file type
      throw new Error(
        `Unsupported file format: ${mimeType || originalName}. Only PDF and text files are supported.`
      );
    } catch (error) {
      throw new Error(
        `Text extraction failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Extract text from a PDF buffer using pdf-parse
   * @param buffer PDF file buffer
   * @returns Promise resolving to extracted text
   * @throws Error if PDF parsing fails
   */
  private async extractPdfText(buffer: Buffer): Promise<string> {
    try {
      const data = await pdfParse(buffer);
      
      if (!data.text || data.text.trim().length === 0) {
        throw new Error('No text content found in PDF');
      }

      return data.text;
    } catch (error) {
      throw new Error(
        `PDF text extraction failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Get file metadata from GridFS
   * @param fileId The ObjectId of the file
   * @returns Promise resolving to file metadata or null if not found
   * @throws Error if metadata retrieval fails
   */
  private async getFileMetadata(fileId: string): Promise<any> {
    try {
      if (!ObjectId.isValid(fileId)) {
        throw new Error('Invalid file ID format');
      }

      const files = await this.bucket.find({ _id: new ObjectId(fileId) }).toArray();

      if (files.length === 0) {
        throw new Error('File not found');
      }

      return files[0];
    } catch (error) {
      throw new Error(
        `Failed to retrieve file metadata: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Delete a file from GridFS
   * @param fileId The ObjectId of the file to delete
   * @returns Promise that resolves when file is deleted
   * @throws Error if deletion fails
   */
  async deleteFile(fileId: string): Promise<void> {
    try {
      if (!ObjectId.isValid(fileId)) {
        throw new Error('Invalid file ID format');
      }

      await this.bucket.delete(new ObjectId(fileId));
    } catch (error) {
      throw new Error(
        `Failed to delete file: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Check if a file exists in GridFS
   * @param fileId The ObjectId of the file
   * @returns Promise resolving to true if file exists, false otherwise
   */
  async fileExists(fileId: string): Promise<boolean> {
    try {
      if (!ObjectId.isValid(fileId)) {
        return false;
      }

      const files = await this.bucket.find({ _id: new ObjectId(fileId) }).toArray();
      return files.length > 0;
    } catch (error) {
      return false;
    }
  }
}
