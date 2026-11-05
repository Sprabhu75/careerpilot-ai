/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeEstimatedMatchScore,
  formatEstimatedMatch,
  MatchRequirement,
} from './career-pilot-logic.ts';

test('computeEstimatedMatchScore: 100% match on all must-have and nice-to-have requirements', () => {
  const reqs: MatchRequirement[] = [
    { text: 'React.js', type: 'must_have', category: 'technical_skill', status: 'matched', evidence: 'React 18', why: 'Direct match' },
    { text: 'TypeScript', type: 'must_have', category: 'technical_skill', status: 'matched', evidence: 'TypeScript', why: 'Direct match' },
    { text: 'Tailwind CSS', type: 'nice_to_have', category: 'tool', status: 'matched', evidence: 'Tailwind CSS', why: 'Direct match' },
  ];

  const result = computeEstimatedMatchScore(reqs);
  assert.equal(result.percentage, 100);
  assert.equal(result.mustHaveCount, 2);
  assert.equal(result.mustHavePoints, 2.0);
  assert.equal(result.mustHavePercentage, 100);
  assert.equal(result.niceToHaveCount, 1);
  assert.equal(result.niceToHavePoints, 1.0);
  assert.equal(result.niceToHavePercentage, 100);
  assert.equal(result.label, 'Estimated match, not an employer ATS score');
});

test('computeEstimatedMatchScore: 0% match when all requirements have no evidence', () => {
  const reqs: MatchRequirement[] = [
    { text: 'Rust', type: 'must_have', category: 'technical_skill', status: 'no_evidence', evidence: null, why: 'No evidence found' },
    { text: 'Kubernetes', type: 'must_have', category: 'tool', status: 'no_evidence', evidence: null, why: 'No evidence found' },
    { text: 'Solidity', type: 'nice_to_have', category: 'technical_skill', status: 'no_evidence', evidence: null, why: 'No evidence found' },
  ];

  const result = computeEstimatedMatchScore(reqs);
  assert.equal(result.percentage, 0);
  assert.equal(result.mustHaveCount, 2);
  assert.equal(result.mustHavePoints, 0);
  assert.equal(result.niceToHaveCount, 1);
  assert.equal(result.niceToHavePoints, 0);
  assert.equal(result.label, 'Estimated match, not an employer ATS score');
});

test('computeEstimatedMatchScore: 50% match when all requirements are partial', () => {
  const reqs: MatchRequirement[] = [
    { text: 'React.js', type: 'must_have', category: 'technical_skill', status: 'partial', evidence: 'Basic React', why: 'Partial' },
    { text: 'Java', type: 'must_have', category: 'technical_skill', status: 'partial', evidence: 'Core Java', why: 'Partial' },
    { text: 'AWS', type: 'nice_to_have', category: 'tool', status: 'partial', evidence: 'EC2 basics', why: 'Partial' },
  ];

  // Must-have: (0.5 + 0.5) / 2 = 0.50
  // Nice-to-have: 0.5 / 1 = 0.50
  // Score: 0.50 * 0.70 + 0.50 * 0.30 = 0.35 + 0.15 = 0.50 -> 50%
  const result = computeEstimatedMatchScore(reqs);
  assert.equal(result.percentage, 50);
  assert.equal(result.mustHavePoints, 1.0);
  assert.equal(result.niceToHavePoints, 0.5);
});

test('computeEstimatedMatchScore: enforces 70% must-have and 30% nice-to-have weighting', () => {
  // Scenario A: 100% must-have, 0% nice-to-have -> exactly 70%
  const reqsA: MatchRequirement[] = [
    { text: 'React', type: 'must_have', category: 'technical_skill', status: 'matched', evidence: 'React', why: 'Matched' },
    { text: 'Docker', type: 'nice_to_have', category: 'tool', status: 'no_evidence', evidence: null, why: 'No evidence' },
  ];
  const resultA = computeEstimatedMatchScore(reqsA);
  assert.equal(resultA.percentage, 70);

  // Scenario B: 0% must-have, 100% nice-to-have -> exactly 30%
  const reqsB: MatchRequirement[] = [
    { text: 'React', type: 'must_have', category: 'technical_skill', status: 'no_evidence', evidence: null, why: 'No evidence' },
    { text: 'Docker', type: 'nice_to_have', category: 'tool', status: 'matched', evidence: 'Docker', why: 'Matched' },
  ];
  const resultB = computeEstimatedMatchScore(reqsB);
  assert.equal(resultB.percentage, 30);

  // Scenario C: 50% must-have (0.5), 100% nice-to-have (1.0) -> (0.5 * 0.7) + (1.0 * 0.3) = 0.35 + 0.30 = 65%
  const reqsC: MatchRequirement[] = [
    { text: 'React', type: 'must_have', category: 'technical_skill', status: 'partial', evidence: 'React', why: 'Partial' },
    { text: 'Docker', type: 'nice_to_have', category: 'tool', status: 'matched', evidence: 'Docker', why: 'Matched' },
  ];
  const resultC = computeEstimatedMatchScore(reqsC);
  assert.equal(resultC.percentage, 65);

  // Scenario D: 100% must-have (1.0), 50% nice-to-have (0.5) -> (1.0 * 0.7) + (0.5 * 0.3) = 0.70 + 0.15 = 85%
  const reqsD: MatchRequirement[] = [
    { text: 'React', type: 'must_have', category: 'technical_skill', status: 'matched', evidence: 'React', why: 'Matched' },
    { text: 'Docker', type: 'nice_to_have', category: 'tool', status: 'partial', evidence: 'Docker', why: 'Partial' },
  ];
  const resultD = computeEstimatedMatchScore(reqsD);
  assert.equal(resultD.percentage, 85);
});

test('computeEstimatedMatchScore: handles roles with only must-have requirements', () => {
  const reqs: MatchRequirement[] = [
    { text: 'DSA', type: 'must_have', category: 'technical_skill', status: 'matched', evidence: '400+ problems', why: 'Matched' },
    { text: 'Java', type: 'must_have', category: 'technical_skill', status: 'partial', evidence: 'College coursework', why: 'Partial' },
  ];

  // Ratio = (1.0 + 0.5) / 2 = 0.75 -> 75%
  const result = computeEstimatedMatchScore(reqs);
  assert.equal(result.percentage, 75);
  assert.equal(result.mustHaveCount, 2);
  assert.equal(result.niceToHaveCount, 0);
  assert.equal(result.niceToHavePoints, 0);
});

test('computeEstimatedMatchScore: handles roles with only nice-to-have requirements', () => {
  const reqs: MatchRequirement[] = [
    { text: 'Figma', type: 'nice_to_have', category: 'tool', status: 'matched', evidence: 'UI mockups', why: 'Matched' },
    { text: 'Next.js', type: 'nice_to_have', category: 'technical_skill', status: 'no_evidence', evidence: null, why: 'No evidence' },
  ];

  // Ratio = (1.0 + 0.0) / 2 = 0.50 -> 50%
  const result = computeEstimatedMatchScore(reqs);
  assert.equal(result.percentage, 50);
  assert.equal(result.mustHaveCount, 0);
  assert.equal(result.niceToHaveCount, 2);
});

test('computeEstimatedMatchScore: handles empty requirement array safely without NaN', () => {
  const result = computeEstimatedMatchScore([]);
  assert.equal(result.percentage, 0);
  assert.equal(result.mustHaveCount, 0);
  assert.equal(result.niceToHaveCount, 0);
  assert.equal(result.mustHavePoints, 0);
  assert.equal(result.niceToHavePoints, 0);
  assert.equal(Number.isNaN(result.percentage), false);
});

test('computeEstimatedMatchScore: verifies point weight values (matched=1.0, partial=0.5, no_evidence=0.0)', () => {
  const reqs: MatchRequirement[] = [
    { text: 'Req 1', type: 'must_have', category: 'technical_skill', status: 'matched', evidence: 'e1', why: 'w1' },     // +1.0
    { text: 'Req 2', type: 'must_have', category: 'technical_skill', status: 'partial', evidence: 'e2', why: 'w2' },     // +0.5
    { text: 'Req 3', type: 'must_have', category: 'technical_skill', status: 'no_evidence', evidence: null, why: 'w3' }, // +0.0
    { text: 'Req 4', type: 'nice_to_have', category: 'tool', status: 'matched', evidence: 'e4', why: 'w4' },             // +1.0
    { text: 'Req 5', type: 'nice_to_have', category: 'tool', status: 'partial', evidence: 'e5', why: 'w5' },             // +0.5
    { text: 'Req 6', type: 'nice_to_have', category: 'tool', status: 'no_evidence', evidence: null, why: 'w6' },         // +0.0
  ];

  const result = computeEstimatedMatchScore(reqs);
  assert.equal(result.mustHavePoints, 1.5);
  assert.equal(result.niceToHavePoints, 1.5);
  // mustHaveRatio = 1.5 / 3 = 0.50
  // niceToHaveRatio = 1.5 / 3 = 0.50
  // Score = (0.50 * 0.70 + 0.50 * 0.30) * 100 = 50%
  assert.equal(result.percentage, 50);
});

test('computeEstimatedMatchScore: verifies required disclaimer label and formula explanation text', () => {
  const result = computeEstimatedMatchScore([
    { text: 'Python', type: 'must_have', category: 'technical_skill', status: 'matched', evidence: 'Python 3', why: 'Direct' },
  ]);

  assert.equal(result.label, 'Estimated match, not an employer ATS score');
  assert.ok(result.formulaDescription.includes('70%'));
  assert.ok(result.formulaDescription.includes('30%'));
  assert.ok(result.formulaDescription.includes('matched = 1.0'));
  assert.ok(result.formulaDescription.includes('partial = 0.5'));
  assert.ok(result.formulaDescription.includes('no_evidence = 0.0'));
});

test('formatEstimatedMatch: verifies score tiers and non-ATS disclaimer', () => {
  const highMatch = formatEstimatedMatch(88, 'Strong technical stack match.');
  assert.equal(highMatch.percentage, 88);
  assert.equal(highMatch.label, 'High Estimated Match (88%)');
  assert.ok(!highMatch.label.toLowerCase().includes('ats score'));
  assert.ok(highMatch.disclaimer.includes('not an ATS score'));

  const moderateMatch = formatEstimatedMatch(62, 'Decent skills; testing missing.');
  assert.equal(moderateMatch.percentage, 62);
  assert.equal(moderateMatch.label, 'Moderate Estimated Match (62%)');

  const lowMatch = formatEstimatedMatch(35, 'Significant skill gaps.');
  assert.equal(lowMatch.percentage, 35);
  assert.equal(lowMatch.label, 'Initial Alignment with Gaps (35%)');

  // Boundary clamping tests
  const clampedHigh = formatEstimatedMatch(120, 'Clamped max test');
  assert.equal(clampedHigh.percentage, 100);

  const clampedLow = formatEstimatedMatch(-15, 'Clamped min test');
  assert.equal(clampedLow.percentage, 0);
});
