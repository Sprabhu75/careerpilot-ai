/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Type } from '@google/genai';

/**
 * 1. Analyze Match Schema (/api/analyze-match)
 * Evaluates candidate resume against target job description with verbatim evidence snippets.
 */
export const analyzeMatchSchema = {
  type: Type.OBJECT,
  properties: {
    estimatedMatchPercentage: { type: Type.NUMBER },
    matchExplanation: { type: Type.STRING },
    matchedCriteria: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          criterion: { type: Type.STRING },
          evidenceSnippet: { type: Type.STRING },
          explanation: { type: Type.STRING },
        },
        required: ['criterion', 'evidenceSnippet', 'explanation'],
      },
    },
    missingEvidenceCriteria: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          criterion: { type: Type.STRING },
          evidenceSnippet: { type: Type.STRING },
          recommendation: { type: Type.STRING },
        },
        required: ['criterion', 'evidenceSnippet', 'recommendation'],
      },
    },
    indianMarketInsights: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    suggestedNextSteps: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
  },
  required: [
    'estimatedMatchPercentage',
    'matchExplanation',
    'matchedCriteria',
    'missingEvidenceCriteria',
    'indianMarketInsights',
    'suggestedNextSteps',
  ],
};

/**
 * 2. Refine Bullets Schema (/api/refine-bullets)
 * Bullet point rewrites preserving factual honesty without fabricating metrics.
 */
export const refineBulletsSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      original: { type: Type.STRING },
      refined: { type: Type.STRING },
      changesMade: { type: Type.STRING },
      metricStatus: {
        type: Type.STRING,
        enum: ['ORIGINAL_METRIC_PRESERVED', 'NO_METRIC_HONEST_FACT_ONLY'],
      },
      honestyAdvice: { type: Type.STRING },
    },
    required: ['original', 'refined', 'changesMade', 'metricStatus', 'honestyAdvice'],
  },
};

/**
 * 3. Interview Prep Schema (/api/interview-prep)
 * Dynamic, resume-grounded questions with frameworks and pitfall warnings.
 */
export const interviewPrepSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING },
      category: {
        type: Type.STRING,
        enum: ['PROJECT_DEEP_DIVE', 'TECHNICAL_CORE', 'HR_BEHAVIORAL'],
      },
      question: { type: Type.STRING },
      resumeTriggerSnippet: { type: Type.STRING },
      interviewerIntent: { type: Type.STRING },
      answerFramework: { type: Type.STRING },
      commonPitfalls: { type: Type.STRING },
    },
    required: [
      'id',
      'category',
      'question',
      'resumeTriggerSnippet',
      'interviewerIntent',
      'answerFramework',
      'commonPitfalls',
    ],
  },
};

/**
 * 4. General Answer Evaluation Schema (/api/evaluate-answer)
 * Evaluates candidate responses against resume ground truth.
 */
export const evaluateAnswerSchema = {
  type: Type.OBJECT,
  properties: {
    overallImpression: { type: Type.STRING },
    strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
    areasToImprove: { type: Type.ARRAY, items: { type: Type.STRING } },
    resumeTruthfulnessAudit: { type: Type.STRING },
    starStructureScore: { type: Type.NUMBER },
    modelAnswer: { type: Type.STRING },
  },
  required: [
    'overallImpression',
    'strengths',
    'areasToImprove',
    'resumeTruthfulnessAudit',
    'starStructureScore',
    'modelAnswer',
  ],
};

/**
 * 5. Generate 10 Interview Questions Schema (/api/generate-interview-questions)
 * Generates 10 structured questions (6 tech, 2 behavioural, 2 scenario) with gap targeting.
 */
export const generateInterviewQuestionsSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.INTEGER },
      type: {
        type: Type.STRING,
        enum: ['technical', 'behavioural', 'scenario'],
      },
      question: { type: Type.STRING },
      difficulty: {
        type: Type.STRING,
        enum: ['easy', 'medium', 'hard'],
      },
      what_a_good_answer_covers: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
      },
      related_requirement: { type: Type.STRING },
    },
    required: [
      'id',
      'type',
      'question',
      'difficulty',
      'what_a_good_answer_covers',
      'related_requirement',
    ],
  },
};

/**
 * 6. Evaluate Interview Answer Schema (/api/evaluate-interview-answer)
 * Scores answers across correctness, clarity, completeness (0-5) with sample answers and tips.
 */
export const evaluateInterviewAnswerSchema = {
  type: Type.OBJECT,
  properties: {
    scores: {
      type: Type.OBJECT,
      properties: {
        correctness: { type: Type.INTEGER },
        clarity: { type: Type.INTEGER },
        completeness: { type: Type.INTEGER },
      },
      required: ['correctness', 'clarity', 'completeness'],
    },
    what_was_good: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    missing_concepts: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    improved_answer_example: { type: Type.STRING },
    one_tip: { type: Type.STRING },
  },
  required: [
    'scores',
    'what_was_good',
    'missing_concepts',
    'improved_answer_example',
    'one_tip',
  ],
};

/**
 * 7. Targeted Cold Outreach Schema (/api/cold-outreach)
 * Generates LinkedIn, Alumni referral, and Hiring Manager messages based on resume facts.
 */
export const coldOutreachSchema = {
  type: Type.OBJECT,
  properties: {
    linkedInConnectionNote: { type: Type.STRING },
    alumniReferralMessage: { type: Type.STRING },
    hiringManagerDirectEmail: { type: Type.STRING },
    subjectLine: { type: Type.STRING },
    tipsForIndianOutreach: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
  },
  required: [
    'linkedInConnectionNote',
    'alumniReferralMessage',
    'hiringManagerDirectEmail',
    'subjectLine',
    'tipsForIndianOutreach',
  ],
};

/**
 * 8. Structured Resume Extraction & Audit Schema (/api/extract-resume)
 * Extracts structured candidate profile and detects weak bullets / missing metrics.
 */
export const extractResumeSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    education: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          degree: { type: Type.STRING },
          institution: { type: Type.STRING },
          year: { type: Type.STRING },
          score: { type: Type.STRING },
        },
        required: ['degree', 'institution', 'year', 'score'],
      },
    },
    experience: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          company: { type: Type.STRING },
          role: { type: Type.STRING },
          duration: { type: Type.STRING },
          bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['company', 'role', 'duration', 'bullets'],
      },
    },
    projects: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          tech: { type: Type.ARRAY, items: { type: Type.STRING } },
          bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['name', 'tech', 'bullets'],
      },
    },
    skills: { type: Type.ARRAY, items: { type: Type.STRING } },
    certifications: { type: Type.ARRAY, items: { type: Type.STRING } },
    issues: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          bullet: { type: Type.STRING },
          type: {
            type: Type.STRING,
            enum: ['unclear_bullet', 'missing_metric', 'formatting_problem'],
          },
          whyWeak: { type: Type.STRING },
        },
        required: ['bullet', 'type', 'whyWeak'],
      },
    },
  },
  required: ['name', 'education', 'experience', 'projects', 'skills', 'certifications', 'issues'],
};

/**
 * 9. Compare Requirements Schema (/api/compare-requirements)
 * Extracts JD requirements, marks status (matched/partial/no_evidence) with verbatim snippet.
 * Note: Never computes a score here. Score is computed deterministically in code.
 */
export const compareRequirementsSchema = {
  type: Type.OBJECT,
  properties: {
    role_title: { type: Type.STRING },
    requirements: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING },
          type: { type: Type.STRING, enum: ['must_have', 'nice_to_have'] },
          category: {
            type: Type.STRING,
            enum: ['technical_skill', 'tool', 'experience', 'education', 'soft_skill'],
          },
          status: { type: Type.STRING, enum: ['matched', 'partial', 'no_evidence'] },
          evidence: { type: Type.STRING, nullable: true },
          why: { type: Type.STRING },
        },
        required: ['text', 'type', 'category', 'status', 'why'],
      },
    },
    top_strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
    top_gaps: { type: Type.ARRAY, items: { type: Type.STRING } },
    summary: { type: Type.STRING },
  },
  required: ['role_title', 'requirements', 'top_strengths', 'top_gaps', 'summary'],
};

/**
 * 10. Tailor Resume Schema (/api/tailor-resume)
 * Bullet point rewrites, summary suggestions, and prioritized gap learning.
 */
export const tailorResumeSchema = {
  type: Type.OBJECT,
  properties: {
    summary_suggestion: { type: Type.STRING },
    bullet_rewrites: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          original: { type: Type.STRING },
          improved: { type: Type.STRING },
          reason: { type: Type.STRING },
          needs_user_input: { type: Type.STRING, nullable: true },
        },
        required: ['original', 'improved', 'reason', 'needs_user_input'],
      },
    },
    keywords_to_add_if_true: { type: Type.ARRAY, items: { type: Type.STRING } },
    skills_to_learn_first: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          skill: { type: Type.STRING },
          why: { type: Type.STRING },
          free_resource_type: { type: Type.STRING },
        },
        required: ['skill', 'why', 'free_resource_type'],
      },
    },
  },
  required: ['summary_suggestion', 'bullet_rewrites', 'keywords_to_add_if_true', 'skills_to_learn_first'],
};
