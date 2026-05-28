import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { wcagCriteria } from "../src/data/wcag/criteria";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(__dirname, "../../backend/wcag.json");

const knowledgeBase = Object.fromEntries(
  wcagCriteria.map((criterion) => [
    criterion.id,
    {
      id: criterion.id,
      title: criterion.title,
      level: criterion.level,
      principle: criterion.principle,
      version: criterion.version,
      summary: criterion.summary,
      description: criterion.description,
      whyItMatters: criterion.whyItMatters,
      bestPractices: criterion.bestPractices ?? [],
      failureScenarios: criterion.failureScenarios ?? [],
      testMethodology: criterion.testMethodology ?? [],
      examples: criterion.examples.map((example) => ({
        id: example.id,
        title: example.title,
        explanation: example.explanation,
        badCode: example.badCode,
        goodCode: example.goodCode,
        accessibilityNotes: example.accessibilityNotes,
        keyboardInstructions: example.keyboardInstructions,
      })),
    },
  ]),
);

writeFileSync(outputPath, `${JSON.stringify(knowledgeBase, null, 2)}\n`, "utf-8");
console.log(`Exported ${wcagCriteria.length} WCAG criteria to ${outputPath}`);
