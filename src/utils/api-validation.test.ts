/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  analyzeRequestSchema,
  tailorRequestSchema,
  questionsRequestSchema,
  evaluateRequestSchema,
  parseDocumentRequestSchema,
  validateUploadedDocument,
} from './api-validation.ts';

test('analyzeRequestSchema validates correct inputs and rejects empty fields', () => {
  const valid = analyzeRequestSchema.safeParse({
    resumeText: 'Software Engineer with React experience',
    jobDescriptionText: 'Looking for React developer',
  });
  assert.equal(valid.success, true);

  const missingJd = analyzeRequestSchema.safeParse({
    resumeText: 'Software Engineer',
    jobDescriptionText: '   ',
  });
  assert.equal(missingJd.success, false);
});

test('tailorRequestSchema validates required resumeText and jobDescriptionText', () => {
  const valid = tailorRequestSchema.safeParse({
    resumeText: 'Built REST APIs in Node.js',
    jobDescriptionText: 'Seeking Node.js engineer',
  });
  assert.equal(valid.success, true);

  const missingResume = tailorRequestSchema.safeParse({
    resumeText: '',
    jobDescriptionText: 'Seeking engineer',
  });
  assert.equal(missingResume.success, false);
});

test('questionsRequestSchema handles defaults and validates level enum', () => {
  const validWithDefaults = questionsRequestSchema.safeParse({
    jobDescriptionText: 'Frontend Developer React',
  });
  assert.equal(validWithDefaults.success, true);
  if (validWithDefaults.success) {
    assert.equal(validWithDefaults.data.level, 'fresher');
    assert.deepEqual(validWithDefaults.data.topGaps, []);
  }

  const invalidLevel = questionsRequestSchema.safeParse({
    jobDescriptionText: 'Frontend Developer',
    level: 'senior-manager',
  });
  assert.equal(invalidLevel.success, false);
});

test('evaluateRequestSchema accepts answer or candidateAnswer and rejects if both empty', () => {
  const withAnswer = evaluateRequestSchema.safeParse({
    question: 'How does React reconciliation work?',
    answer: 'React creates a virtual DOM tree and diffs it against current DOM.',
  });
  assert.equal(withAnswer.success, true);

  const withCandidateAnswer = evaluateRequestSchema.safeParse({
    question: 'How does React reconciliation work?',
    candidateAnswer: 'React creates a virtual DOM tree and diffs it against current DOM.',
  });
  assert.equal(withCandidateAnswer.success, true);

  const emptyAnswer = evaluateRequestSchema.safeParse({
    question: 'How does React reconciliation work?',
    answer: '',
    candidateAnswer: '',
  });
  assert.equal(emptyAnswer.success, false);
});

test('validateUploadedDocument approves valid PDF with magic bytes', () => {
  const pdfHeader = Buffer.from('%PDF-1.4 simulated binary data');
  const result = validateUploadedDocument('resume.pdf', 'application/pdf', pdfHeader);
  assert.equal(result.valid, true);
  assert.equal(result.type, 'pdf');
});

test('validateUploadedDocument approves valid DOCX with PK magic bytes', () => {
  const docxHeader = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x00, 0x00]);
  const result = validateUploadedDocument(
    'resume.docx',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    docxHeader
  );
  assert.equal(result.valid, true);
  assert.equal(result.type, 'docx');
});

test('validateUploadedDocument rejects non-PDF/DOCX file formats like exe or png', () => {
  const exeBuffer = Buffer.from([0x4d, 0x5a, 0x90, 0x00]);
  const result = validateUploadedDocument('malicious.exe', 'application/x-msdownload', exeBuffer);
  assert.equal(result.valid, false);
  assert.equal(result.type, 'unsupported');
});

test('validateUploadedDocument rejects fake PDF extension with non-PDF headers', () => {
  const fakePdf = Buffer.from('Plain text claiming to be a PDF document');
  const result = validateUploadedDocument('fake.pdf', 'application/pdf', fakePdf);
  assert.equal(result.valid, false);
  assert.match(result.error || '', /header does not match/);
});
