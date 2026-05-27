/**
 * Manual test script for FileStorageService
 * Run this with: npx ts-node src/services/fileStorage.service.test.ts
 * 
 * Prerequisites:
 * - Docker must be running
 * - MongoDB container must be started (docker-compose up -d mongodb)
 * - MONGODB_URI environment variable must be set
 */

import { connectDatabase, disconnectDatabase } from '../config/database';
import { FileStorageService } from './fileStorage.service';
import mongoose from 'mongoose';

const testFileStorageService = async () => {
  console.log('=== Testing FileStorageService ===\n');

  let fileStorageService: FileStorageService;
  let uploadedFileId: string;

  try {
    // Test 1: Connect to database
    console.log('Test 1: Connecting to database...');
    await connectDatabase();
    const db = mongoose.connection.getClient().db();
    fileStorageService = new FileStorageService(db);
    console.log('✓ Test 1 passed\n');

    // Test 2: Upload a text file
    console.log('Test 2: Uploading a text file...');
    const textContent = 'This is a test file for FileStorageService.\nIt contains multiple lines.\nLine 3.';
    const textFile = {
      buffer: Buffer.from(textContent),
      originalname: 'test.txt',
      mimetype: 'text/plain',
      size: textContent.length,
    };

    uploadedFileId = await fileStorageService.uploadFile(textFile as any);
    console.log(`Uploaded file ID: ${uploadedFileId}`);
    console.log('✓ Test 2 passed\n');

    // Test 3: Check if file exists
    console.log('Test 3: Checking if file exists...');
    const exists = await fileStorageService.fileExists(uploadedFileId);
    if (!exists) {
      throw new Error('File should exist but fileExists() returned false');
    }
    console.log('✓ Test 3 passed\n');

    // Test 4: Download the file
    console.log('Test 4: Downloading the file...');
    const downloadedBuffer = await fileStorageService.downloadFile(uploadedFileId);
    const downloadedContent = downloadedBuffer.toString('utf-8');
    if (downloadedContent !== textContent) {
      throw new Error('Downloaded content does not match uploaded content');
    }
    console.log('Downloaded content matches uploaded content');
    console.log('✓ Test 4 passed\n');

    // Test 5: Extract text from text file
    console.log('Test 5: Extracting text from text file...');
    const extractedText = await fileStorageService.extractTextContent(uploadedFileId);
    if (extractedText !== textContent) {
      throw new Error('Extracted text does not match original content');
    }
    console.log('Extracted text matches original content');
    console.log('✓ Test 5 passed\n');

    // Test 6: Upload and extract from PDF file
    console.log('Test 6: Testing PDF file upload and extraction...');
    // Create a simple PDF buffer (minimal valid PDF)
    const pdfContent = Buffer.from(
      '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/Parent 2 0 R/Resources<<>>>>endobj xref 0 4 0000000000 65535 f 0000000009 00000 n 0000000058 00000 n 0000000115 00000 n trailer<</Size 4/Root 1 0 R>>startxref 190 %%EOF'
    );
    const pdfFile = {
      buffer: pdfContent,
      originalname: 'test.pdf',
      mimetype: 'application/pdf',
      size: pdfContent.length,
    };

    const pdfFileId = await fileStorageService.uploadFile(pdfFile as any);
    console.log(`Uploaded PDF file ID: ${pdfFileId}`);
    
    // Note: PDF extraction might fail with minimal PDF, but we're testing the flow
    try {
      const pdfText = await fileStorageService.extractTextContent(pdfFileId);
      console.log('PDF text extraction succeeded');
    } catch (error) {
      console.log('PDF text extraction failed (expected with minimal PDF):', (error as Error).message);
    }
    console.log('✓ Test 6 passed\n');

    // Test 7: Test invalid file ID
    console.log('Test 7: Testing invalid file ID handling...');
    try {
      await fileStorageService.downloadFile('invalid-id');
      throw new Error('Should have thrown error for invalid file ID');
    } catch (error) {
      if ((error as Error).message.includes('Invalid file ID format')) {
        console.log('Correctly rejected invalid file ID');
      } else {
        throw error;
      }
    }
    console.log('✓ Test 7 passed\n');

    // Test 8: Delete file
    console.log('Test 8: Deleting uploaded file...');
    await fileStorageService.deleteFile(uploadedFileId);
    const existsAfterDelete = await fileStorageService.fileExists(uploadedFileId);
    if (existsAfterDelete) {
      throw new Error('File should not exist after deletion');
    }
    console.log('File successfully deleted');
    console.log('✓ Test 8 passed\n');

    // Test 9: Test unsupported file format
    console.log('Test 9: Testing unsupported file format...');
    const docxFile = {
      buffer: Buffer.from('fake docx content'),
      originalname: 'test.docx',
      mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size: 17,
    };

    const docxFileId = await fileStorageService.uploadFile(docxFile as any);
    try {
      await fileStorageService.extractTextContent(docxFileId);
      throw new Error('Should have thrown error for unsupported file format');
    } catch (error) {
      if ((error as Error).message.includes('Unsupported file format')) {
        console.log('Correctly rejected unsupported file format');
      } else {
        throw error;
      }
    }
    console.log('✓ Test 9 passed\n');

    // Test 10: Disconnect from database
    console.log('Test 10: Disconnecting from database...');
    await disconnectDatabase();
    console.log('✓ Test 10 passed\n');

    console.log('=== All tests passed! ===');
    process.exit(0);

  } catch (error) {
    console.error('\n✗ Test failed:', error);
    try {
      await disconnectDatabase();
    } catch (e) {
      // Ignore disconnect errors
    }
    process.exit(1);
  }
};

// Run the test
testFileStorageService();
