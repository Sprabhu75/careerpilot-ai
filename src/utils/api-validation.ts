/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

/**
 * Zod schema for /api/analyze request
 */
export const analyzeRequestSchema = z.object({
  resumeText: z.string().trim().min(1, 'Resume text is required'),
  jobDescriptionText: z.string().trim().min(1, 'Job description text is required'),
  roleContext: z.string().optional(),
});

export type AnalyzeRequestInput = z.infer<typeof analyzeRequestSchema>;

/**
 * Zod schema for /api/tailor request
 */
export const tailorRequestSchema = z.object({
  resumeText: z.string().trim().min(1, 'Resume text is required'),
  jobDescriptionText: z.string().trim().min(1, 'Job description text is required'),
});

export type TailorRequestInput = z.infer<typeof tailorRequestSchema>;

/**
 * Zod schema for /api/questions request
 */
export const questionsRequestSchema = z.object({
  jobDescriptionText: z.string().trim().min(1, 'Job description text is required'),
  resumeText: z.string().optional().default(''),
  topGaps: z.array(z.string()).optional().default([]),
  level: z.enum(['fresher', '1-3 years']).optional().default('fresher'),
});

export type QuestionsRequestInput = z.infer<typeof questionsRequestSchema>;

/**
 * Zod schema for /api/evaluate request
 */
export const evaluateRequestSchema = z
  .object({
    question: z.string().trim().min(1, 'Question is required'),
    answer: z.string().trim().optional(),
    candidateAnswer: z.string().trim().optional(),
    what_a_good_answer_covers: z.array(z.string()).optional().default([]),
    resumeText: z.string().optional(),
  })
  .refine(
    (data) =>
      Boolean((data.answer && data.answer.length > 0) || (data.candidateAnswer && data.candidateAnswer.length > 0)),
    {
      message: 'Candidate answer is required (provide "answer" or "candidateAnswer")',
      path: ['answer'],
    }
  );

export type EvaluateRequestInput = z.infer<typeof evaluateRequestSchema>;

/**
 * Zod schema for /api/parse-document request
 */
export const parseDocumentRequestSchema = z.object({
  fileBase64: z.string().min(1, 'File base64 content is required'),
  fileName: z.string().min(1, 'File name is required'),
  fileType: z.string().optional(),
});

export type ParseDocumentRequestInput = z.infer<typeof parseDocumentRequestSchema>;

export interface FileValidationResult {
  valid: boolean;
  type: 'pdf' | 'docx' | 'unsupported';
  error?: string;
}

/**
 * Strict file type and signature validation for uploaded documents:
 * Accepts only PDF and DOCX files.
 * Validates file extension, MIME type, and magic bytes.
 */
export function validateUploadedDocument(
  fileName: string,
  fileType?: string,
  buffer?: Buffer
): FileValidationResult {
  const nameLower = (fileName || '').toLowerCase();
  const isPdfExtension = nameLower.endsWith('.pdf');
  const isDocxExtension = nameLower.endsWith('.docx');
  const isPdfMime = fileType === 'application/pdf';
  const isDocxMime =
    Boolean(fileType?.includes('wordprocessingml') || fileType?.includes('officedocument'));

  if (!isPdfExtension && !isDocxExtension && !isPdfMime && !isDocxMime) {
    return {
      valid: false,
      type: 'unsupported',
      error:
        'Unsupported file format. CareerPilot AI strictly accepts PDF (.pdf) and Word DOCX (.docx) files only. Please upload a valid document or paste text directly.',
    };
  }

  // If buffer is provided, verify magic bytes
  if (buffer && buffer.length > 0) {
    // PDF header: "%PDF" (0x25, 0x50, 0x44, 0x46)
    const isPdfMagic =
      buffer.length >= 4 &&
      buffer[0] === 0x25 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x44 &&
      buffer[3] === 0x46;

    // DOCX header (ZIP format): "PK" (0x50, 0x4B)
    const isZipMagic =
      buffer.length >= 2 &&
      buffer[0] === 0x50 &&
      buffer[1] === 0x4b;

    if (isPdfExtension || isPdfMime) {
      if (!isPdfMagic) {
        return {
          valid: false,
          type: 'unsupported',
          error:
            'Corrupted or invalid PDF file. File header does not match standard PDF specification (%PDF-).',
        };
      }
      return { valid: true, type: 'pdf' };
    }

    if (isDocxExtension || isDocxMime) {
      if (!isZipMagic) {
        return {
          valid: false,
          type: 'unsupported',
          error:
            'Corrupted or invalid DOCX file. File header does not match standard Office Open XML package specification.',
        };
      }
      return { valid: true, type: 'docx' };
    }
  }

  return {
    valid: true,
    type: isPdfExtension || isPdfMime ? 'pdf' : 'docx',
  };
}
