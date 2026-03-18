import db from "../../db/client";
import {
  roastAnalysisItems,
  roastDiffBlocks,
  roastDiffLines,
  roastSubmissions,
} from "../../db/schema";

const mockRoasts = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    shareSlug: "forgot-to-close-loop",
    sourceCode: `function processArray(arr) {
  for (let i = 0; i < arr.length; i++
    console.log(arr[i])
  }
}

// Missing closing brace and semicolon in for loop`,
    sourceLineCount: 7,
    language: "javascript" as const,
    mode: "roast" as const,
    status: "completed" as const,
    visibility: "public" as const,
    score: "1.5",
    verdict: "needs_serious_help" as const,
    headline: "Syntax error in for loop - forgot the closing parenthesis!",
    summary:
      "This code has a critical syntax error that will cause it to fail immediately.",
    modelName: "gpt-4",
    analysisItems: [
      {
        severity: "critical" as const,
        title: "Syntax Error in For Loop",
        description:
          "The for loop is missing a closing parenthesis. This will cause a parse error.",
        displayOrder: 1,
      },
      {
        severity: "critical" as const,
        title: "Missing Closing Brace",
        description: "Function body is missing the closing brace.",
        displayOrder: 2,
      },
    ],
    diffBlock: {
      fromLabel: "buggy_code.js",
      toLabel: "fixed_code.js",
    },
    diffLines: [
      {
        kind: "context" as const,
        displayOrder: 1,
        content: "function processArray(arr) {",
        oldLineNumber: 1,
        newLineNumber: 1,
      },
      {
        kind: "removed" as const,
        displayOrder: 2,
        content: "  for (let i = 0; i < arr.length; i++",
        oldLineNumber: 2,
        newLineNumber: null,
      },
      {
        kind: "added" as const,
        displayOrder: 3,
        content: "  for (let i = 0; i < arr.length; i++) {",
        oldLineNumber: null,
        newLineNumber: 2,
      },
      {
        kind: "context" as const,
        displayOrder: 4,
        content: "    console.log(arr[i])",
        oldLineNumber: 3,
        newLineNumber: 3,
      },
      {
        kind: "removed" as const,
        displayOrder: 5,
        content: "  }",
        oldLineNumber: 4,
        newLineNumber: null,
      },
      {
        kind: "added" as const,
        displayOrder: 6,
        content: "  }",
        oldLineNumber: null,
        newLineNumber: 4,
      },
      {
        kind: "added" as const,
        displayOrder: 7,
        content: "}",
        oldLineNumber: null,
        newLineNumber: 5,
      },
    ],
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    shareSlug: "variable-shadowing-disaster",
    sourceCode: `let count = 0;
function incrementCount() {
  let count = 1;
  count++;
  return count;
}
console.log(incrementCount());
console.log(count);`,
    sourceLineCount: 8,
    language: "javascript" as const,
    mode: "honest" as const,
    status: "completed" as const,
    visibility: "public" as const,
    score: "2.0",
    verdict: "rough_but_fixable" as const,
    headline:
      "Variable shadowing creates confusion - outer scope is never modified",
    summary:
      "The inner variable shadows the outer one, leading to unexpected behavior.",
    modelName: "gpt-4",
    analysisItems: [
      {
        severity: "warning" as const,
        title: "Variable Shadowing",
        description:
          "Local variable shadows the outer scope variable, making code confusing.",
        displayOrder: 1,
      },
      {
        severity: "good" as const,
        title: "Proper Function Structure",
        description: "Function returns its result correctly.",
        displayOrder: 2,
      },
    ],
    diffBlock: {
      fromLabel: "confusing_code.js",
      toLabel: "clear_code.js",
    },
    diffLines: [
      {
        kind: "context" as const,
        displayOrder: 1,
        content: "let count = 0;",
        oldLineNumber: 1,
        newLineNumber: 1,
      },
      {
        kind: "context" as const,
        displayOrder: 2,
        content: "function incrementCount() {",
        oldLineNumber: 2,
        newLineNumber: 2,
      },
      {
        kind: "removed" as const,
        displayOrder: 3,
        content: "  let count = 1;",
        oldLineNumber: 3,
        newLineNumber: null,
      },
      {
        kind: "added" as const,
        displayOrder: 4,
        content: "  count = 1;",
        oldLineNumber: null,
        newLineNumber: 3,
      },
      {
        kind: "context" as const,
        displayOrder: 5,
        content: "  count++;",
        oldLineNumber: 4,
        newLineNumber: 4,
      },
      {
        kind: "context" as const,
        displayOrder: 6,
        content: "  return count;",
        oldLineNumber: 5,
        newLineNumber: 5,
      },
      {
        kind: "context" as const,
        displayOrder: 7,
        content: "}",
        oldLineNumber: 6,
        newLineNumber: 6,
      },
    ],
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    shareSlug: "sql-injection-nightmare",
    sourceCode: `const username = "admin' OR '1'='1";
const query = "SELECT * FROM users WHERE name = '" + username + "'";
db.query(query);`,
    sourceLineCount: 3,
    language: "sql" as const,
    mode: "roast" as const,
    status: "completed" as const,
    visibility: "public" as const,
    score: "0.5",
    verdict: "needs_serious_help" as const,
    headline:
      "SQL injection vulnerability - classic string concatenation disaster",
    summary:
      "String concatenation with user input is a major security vulnerability.",
    modelName: "gpt-4",
    analysisItems: [
      {
        severity: "critical" as const,
        title: "SQL Injection Vulnerability",
        description:
          "Concatenating user input directly into SQL query allows attackers to modify query logic.",
        displayOrder: 1,
      },
      {
        severity: "critical" as const,
        title: "No Input Validation",
        description: "No sanitization or parameterization of user input.",
        displayOrder: 2,
      },
    ],
    diffBlock: {
      fromLabel: "vulnerable.js",
      toLabel: "secure.js",
    },
    diffLines: [
      {
        kind: "removed" as const,
        displayOrder: 1,
        content:
          'const query = "SELECT * FROM users WHERE name = \'" + username + "\'";',
        oldLineNumber: 2,
        newLineNumber: null,
      },
      {
        kind: "added" as const,
        displayOrder: 2,
        content: 'const query = "SELECT * FROM users WHERE name = $1";',
        oldLineNumber: null,
        newLineNumber: 2,
      },
      {
        kind: "added" as const,
        displayOrder: 3,
        content: "db.query(query, [username]);",
        oldLineNumber: null,
        newLineNumber: 3,
      },
      {
        kind: "removed" as const,
        displayOrder: 4,
        content: "db.query(query);",
        oldLineNumber: 3,
        newLineNumber: null,
      },
    ],
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    shareSlug: "typescript-any-everywhere",
    sourceCode: `function processData(data: any): any {
  return data.result.value.nested.deep.property;
}

const result = processData(someData);`,
    sourceLineCount: 5,
    language: "typescript" as const,
    mode: "honest" as const,
    status: "completed" as const,
    visibility: "public" as const,
    score: "1.5",
    verdict: "rough_but_fixable" as const,
    headline:
      "Using `any` type defeats the purpose of TypeScript - lose type safety",
    summary:
      "The code defeats TypeScript type system by using `any`, removing all type checking benefits.",
    modelName: "gpt-4",
    analysisItems: [
      {
        severity: "warning" as const,
        title: "Excessive use of `any` type",
        description:
          "Using `any` type everywhere removes TypeScript benefits and type safety.",
        displayOrder: 1,
      },
      {
        severity: "critical" as const,
        title: "Unsafe property access",
        description:
          "Deep property chaining without type safety can cause runtime errors.",
        displayOrder: 2,
      },
    ],
    diffBlock: {
      fromLabel: "unsafe.ts",
      toLabel: "safe.ts",
    },
    diffLines: [
      {
        kind: "removed" as const,
        displayOrder: 1,
        content: "function processData(data: any): any {",
        oldLineNumber: 1,
        newLineNumber: null,
      },
      {
        kind: "added" as const,
        displayOrder: 2,
        content: "interface DataStructure {",
        oldLineNumber: null,
        newLineNumber: 1,
      },
      {
        kind: "added" as const,
        displayOrder: 3,
        content:
          "  result: { value: { nested: { deep: { property: string } } } }",
        oldLineNumber: null,
        newLineNumber: 2,
      },
      {
        kind: "added" as const,
        displayOrder: 4,
        content: "}",
        oldLineNumber: null,
        newLineNumber: 3,
      },
      {
        kind: "added" as const,
        displayOrder: 5,
        content: "function processData(data: DataStructure): string {",
        oldLineNumber: null,
        newLineNumber: 4,
      },
      {
        kind: "context" as const,
        displayOrder: 6,
        content: "  return data.result.value.nested.deep.property;",
        oldLineNumber: 2,
        newLineNumber: 5,
      },
    ],
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440005",
    shareSlug: "python-efficiency-fail",
    sourceCode: `def find_duplicate(items):
    for i in items:
        for j in items:
            if i == j and items.index(i) != items.index(j):
                return i
    return None`,
    sourceLineCount: 6,
    language: "python" as const,
    mode: "roast" as const,
    status: "completed" as const,
    visibility: "public" as const,
    score: "2.5",
    verdict: "actually_not_bad" as const,
    headline:
      "O(n²) algorithm with additional O(n) lookups inside - performance nightmare",
    summary:
      "Nested loops with index() calls create O(n³) complexity for a O(n) problem.",
    modelName: "gpt-4",
    analysisItems: [
      {
        severity: "critical" as const,
        title: "Poor Time Complexity",
        description:
          "Nested loops with index() lookups create O(n³) complexity.",
        displayOrder: 1,
      },
      {
        severity: "warning" as const,
        title: "Inefficient Algorithm Choice",
        description: "Could use a set or dict to solve this in O(n) time.",
        displayOrder: 2,
      },
      {
        severity: "good" as const,
        title: "Clear Intent",
        description: "The code clearly shows the intent to find duplicates.",
        displayOrder: 3,
      },
    ],
    diffBlock: {
      fromLabel: "slow.py",
      toLabel: "fast.py",
    },
    diffLines: [
      {
        kind: "removed" as const,
        displayOrder: 1,
        content: "def find_duplicate(items):",
        oldLineNumber: 1,
        newLineNumber: null,
      },
      {
        kind: "added" as const,
        displayOrder: 2,
        content: "def find_duplicate(items):",
        oldLineNumber: null,
        newLineNumber: 1,
      },
      {
        kind: "removed" as const,
        displayOrder: 3,
        content: "    for i in items:",
        oldLineNumber: 2,
        newLineNumber: null,
      },
      {
        kind: "removed" as const,
        displayOrder: 4,
        content: "        for j in items:",
        oldLineNumber: 3,
        newLineNumber: null,
      },
      {
        kind: "removed" as const,
        displayOrder: 5,
        content: "            if i == j and items.index(i) != items.index(j):",
        oldLineNumber: 4,
        newLineNumber: null,
      },
      {
        kind: "removed" as const,
        displayOrder: 6,
        content: "                return i",
        oldLineNumber: 5,
        newLineNumber: null,
      },
      {
        kind: "added" as const,
        displayOrder: 7,
        content: "    seen = set()",
        oldLineNumber: null,
        newLineNumber: 2,
      },
      {
        kind: "added" as const,
        displayOrder: 8,
        content: "    for item in items:",
        oldLineNumber: null,
        newLineNumber: 3,
      },
      {
        kind: "added" as const,
        displayOrder: 9,
        content: "        if item in seen:",
        oldLineNumber: null,
        newLineNumber: 4,
      },
      {
        kind: "added" as const,
        displayOrder: 10,
        content: "            return item",
        oldLineNumber: null,
        newLineNumber: 5,
      },
      {
        kind: "added" as const,
        displayOrder: 11,
        content: "        seen.add(item)",
        oldLineNumber: null,
        newLineNumber: 6,
      },
    ],
  },
];

export async function seedLeaderboard() {
  try {
    for (const roastData of mockRoasts) {
      const { analysisItems, diffBlock, diffLines, ...submissionData } =
        roastData;

      // Insert submission
      const [submission] = await db
        .insert(roastSubmissions)
        .values({
          ...submissionData,
          score: roastData.score,
          mode: roastData.mode,
          status: roastData.status,
          visibility: roastData.visibility,
        })
        .returning();

      if (!submission) continue;

      // Insert analysis items
      if (analysisItems && analysisItems.length > 0) {
        await db.insert(roastAnalysisItems).values(
          analysisItems.map((item) => ({
            ...item,
            submissionId: submission.id,
          })),
        );
      }

      // Insert diff block
      const [diffBlockRecord] = await db
        .insert(roastDiffBlocks)
        .values({
          ...diffBlock,
          submissionId: submission.id,
        })
        .returning();

      if (!diffBlockRecord) continue;

      // Insert diff lines
      if (diffLines && diffLines.length > 0) {
        await db.insert(roastDiffLines).values(
          diffLines.map((line) => ({
            ...line,
            diffBlockId: diffBlockRecord.id,
          })),
        );
      }
    }

    console.log("✅ Leaderboard seed completed successfully");
  } catch (error) {
    console.error("❌ Error seeding leaderboard:", error);
    throw error;
  }
}

seedLeaderboard();
