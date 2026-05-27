/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TestStep {
  step: string;
  expected: string;
}

export interface CodeExample {
  id: string;
  title: string;
  explanation: string;
  badCode: string;
  goodCode: string;
  accessibilityNotes: {
    bad: string[];
    good: string[];
  };
  keyboardInstructions: string[];
  // Programs static audit selectors to let the platform run active checks inside the preview!
  auditChecker?: {
    badAudit: (container: HTMLElement) => { passed: boolean; message: string };
    goodAudit: (container: HTMLElement) => { passed: boolean; message: string };
    description: string;
  };
}

export interface WCAGCriterion {
  id: string; // e.g., "1.1.1"
  title: string; // e.g., "Non-text Content"
  level: "A" | "AA" | "AAA";
  principle: "Perceivable" | "Operable" | "Understandable" | "Robust";
  version: "2.0" | "2.1" | "2.2";
  summary: string;
  description: string;
  whyItMatters: string;
  examples: CodeExample[];
  bestPractices?: string[];
  failureScenarios?: string[];
  testMethodology?: string[];
}
