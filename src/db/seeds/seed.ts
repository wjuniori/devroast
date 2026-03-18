import { faker } from "@faker-js/faker";
import { v4 as uuidv4 } from "uuid";
import db from "../client";
import {
  roastAnalysisItems,
  roastDiffBlocks,
  roastDiffLines,
  roastSubmissions,
} from "../schema";

const languages = [
  "javascript",
  "typescript",
  "python",
  "sql",
  "java",
  "go",
  "rust",
  "cpp",
  "csharp",
  "php",
  "ruby",
] as const;

const modes = ["roast", "honest"] as const;
const verdicts = [
  "needs_serious_help",
  "rough_but_fixable",
  "actually_not_bad",
  "clean_enough",
] as const;
const severities = ["critical", "warning", "good"] as const;
const diffLineKinds = ["context", "added", "removed"] as const;

// Snippets de código de exemplo por linguagem
const codeSnippets: Record<string, string[]> = {
  javascript: [
    `function calc(x) {
  let result = 0
  for(let i=0;i<10;i++)
  result = result + x * 2
  return result
}`,
    `const data = fetch('api/data').then(r=>r.json())
const items = data.map(x=>{ return {id:x.id,name:x.name} })
console.log(items)`,
    `function debounce(fn, wait) {
  let timeout
  return function(...args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => fn(...args), wait)
  }
}`,
    `const obj = {}
for(let key in obj) {
  if(obj.hasOwnProperty(key)) {
    console.log(key)
  }
}`,
    `function processArray(arr) {
  for(let i=0; i<=arr.length; i++) {
    console.log(arr[i])
  }
}`,
  ],
  typescript: [
    `interface User {
  id: number
  name: string
  email: string
  role: "admin" | "user"
}

function getUser(id: any): any {
  return fetch(\`/api/users/\${id}\`)
}`,
    `type Data = any

function transform(input: Data): Data {
  return input.map((x: any) => ({...x, processed: true}))
}`,
    `class Handler {
  private data: any
  
  process() {
    this.data.forEach((x: any) => {
      this.handle(x)
    })
  }
  
  private handle(item: any) {
    console.log(item)
  }
}`,
  ],
  python: [
    `def process_data(items):
    result = []
    for i in range(len(items)):
        for j in range(len(items)):
            if items[i] == items[j]:
                result.append(items[i])
    return result`,
    `import requests

def fetch_data():
    response = requests.get('https://api.example.com/data')
    data = response.json()
    return data['results'][0]['value']`,
    `def calculate(x, y):
    if x > y:
        return x - y
    elif y > x:
        return y - x
    else:
        return 0`,
  ],
  sql: [
    `SELECT * FROM users 
WHERE username = 'admin'
AND password = MD5('secret')`,
    `SELECT u.*, o.* FROM users u, orders o
WHERE u.id = o.user_id
AND u.id = 1`,
    `SELECT COUNT(*) as cnt
FROM products p
LEFT JOIN inventory i ON p.id = i.product_id
GROUP BY p.id`,
  ],
  java: [
    `public class DataProcessor {
  public void process(List items) {
    for(Object item : items) {
      System.out.println(item);
    }
  }
}`,
    `ArrayList list = new ArrayList();
for(int i = 0; i < 100; i++) {
  list.add(i);
}`,
  ],
  go: [
    `func ProcessData(data interface{}) interface{} {
  return data
}`,
    `func getUser(id string) *User {
  user := &User{}
  user.ID = id
  return user
}`,
  ],
  rust: [
    `fn process(x: i32) -> i32 {
  let mut result = 0;
  for i in 0..10 {
    result += x * 2;
  }
  result
}`,
  ],
  cpp: [
    `void process(vector<int> arr) {
  for(int i = 0; i <= arr.size(); i++) {
    cout << arr[i] << endl;
  }
}`,
  ],
  csharp: [
    `public class DataHandler {
  public void Process(List<object> items) {
    foreach(var item in items) {
      Console.WriteLine(item);
    }
  }
}`,
  ],
  php: [
    `<?php
$username = $_GET['user'];
$query = "SELECT * FROM users WHERE username = '" . $username . "'";
$result = mysqli_query($conn, $query);
?>`,
  ],
  ruby: [
    `def process_data(items)
  items.each do |item|
    puts item
  end
end`,
  ],
};

// Título de análise por linguagem e severidade
const analysisTemplates = {
  javascript: {
    critical: [
      "Missing error handling in async operation",
      "Race condition in event listener",
      "Memory leak in event binding",
      "Unhandled promise rejection",
    ],
    warning: [
      "Inconsistent naming convention",
      "Missing JSDoc comments",
      "Unused variable declaration",
      "Potential null pointer access",
    ],
    good: [
      "Proper use of arrow functions",
      "Good function composition",
      "Clear variable naming",
      "Efficient array methods",
    ],
  },
  typescript: {
    critical: [
      "Unsafe type assertion with 'any'",
      "Missing null check before property access",
      "Unhandled promise rejection",
      "Generic type not properly constrained",
    ],
    warning: [
      "Implicit 'any' type detected",
      "Missing return type annotation",
      "Unused type definition",
      "Over-generic type parameter",
    ],
    good: [
      "Proper interface implementation",
      "Good use of union types",
      "Clear generic constraints",
      "Type-safe error handling",
    ],
  },
  python: {
    critical: [
      "SQL injection vulnerability",
      "Unhandled exception in loop",
      "Mutable default argument",
      "O(n²) algorithm where O(n) is possible",
    ],
    warning: [
      "Missing docstring",
      "Inconsistent naming style",
      "Bare except clause",
      "Unused import",
    ],
    good: [
      "Good use of list comprehensions",
      "Proper error handling",
      "Clear function documentation",
      "Efficient data structures",
    ],
  },
  sql: {
    critical: [
      "SQL injection vulnerability",
      "Missing WHERE clause",
      "Cartesian product risk",
      "Unindexed join condition",
    ],
    warning: [
      "SELECT * should specify columns",
      "Missing LIMIT clause",
      "Inefficient GROUP BY",
      "Not using prepared statements",
    ],
    good: [
      "Proper use of INNER JOIN",
      "Good index usage",
      "Efficient aggregation",
      "Clear alias naming",
    ],
  },
};

interface RoastItem {
  severity: (typeof severities)[number];
  title: string;
  description: string;
  displayOrder: number;
}

interface DiffLine {
  kind: (typeof diffLineKinds)[number];
  displayOrder: number;
  content: string;
  oldLineNumber: number | null;
  newLineNumber: number | null;
}

function generateAnalysisItems(
  language: (typeof languages)[number],
  count: number = 3,
): RoastItem[] {
  const items: RoastItem[] = [];
  const template =
    analysisTemplates[language as keyof typeof analysisTemplates];

  if (!template) {
    // Fallback para linguagens sem template
    for (let i = 0; i < count; i++) {
      const severity =
        severities[Math.floor(Math.random() * severities.length)];
      items.push({
        severity,
        title: faker.lorem.words({ min: 2, max: 4 }),
        description: faker.lorem.sentence(),
        displayOrder: i + 1,
      });
    }
    return items;
  }

  // Sempre incluir pelo menos 1 critical, 1 warning, 1 good
  const criticalItems = template.critical || [];
  const warningItems = template.warning || [];
  const goodItems = template.good || [];

  if (criticalItems.length > 0) {
    items.push({
      severity: "critical",
      title: criticalItems[Math.floor(Math.random() * criticalItems.length)],
      description: faker.lorem.sentence(),
      displayOrder: 1,
    });
  }

  if (warningItems.length > 0 && count > 1) {
    items.push({
      severity: "warning",
      title: warningItems[Math.floor(Math.random() * warningItems.length)],
      description: faker.lorem.sentence(),
      displayOrder: 2,
    });
  }

  if (goodItems.length > 0 && count > 2) {
    items.push({
      severity: "good",
      title: goodItems[Math.floor(Math.random() * goodItems.length)],
      description: faker.lorem.sentence(),
      displayOrder: 3,
    });
  }

  return items;
}

function generateDiffLines(): DiffLine[] {
  const lines: DiffLine[] = [];
  const lineCount = faker.number.int({ min: 5, max: 15 });

  for (let i = 0; i < lineCount; i++) {
    const kind =
      diffLineKinds[Math.floor(Math.random() * diffLineKinds.length)];
    lines.push({
      kind,
      displayOrder: i + 1,
      content: faker.lorem.words({ min: 1, max: 8 }),
      oldLineNumber: kind === "removed" || kind === "context" ? i + 1 : null,
      newLineNumber: kind === "added" || kind === "context" ? i + 1 : null,
    });
  }

  return lines;
}

function generateSourceCode(language: (typeof languages)[number]): string {
  const snippets = codeSnippets[language];
  if (snippets && snippets.length > 0) {
    return snippets[Math.floor(Math.random() * snippets.length)];
  }
  return faker.lorem.paragraphs(2);
}

function countSourceLines(code: string): number {
  return code.split("\n").length;
}

async function seedDatabase() {
  try {
    console.log("🌱 Starting seed process...");

    const roastsToInsert = 100;

    for (let i = 0; i < roastsToInsert; i++) {
      const language = languages[Math.floor(Math.random() * languages.length)];
      const mode = modes[Math.floor(Math.random() * modes.length)];
      const visibility =
        Math.random() > 0.7
          ? "public"
          : Math.random() > 0.5
            ? "unlisted"
            : "private";
      const verdict = verdicts[Math.floor(Math.random() * verdicts.length)];

      const sourceCode = generateSourceCode(language);
      const sourceLineCount = countSourceLines(sourceCode);
      const score = (Math.random() * 3).toFixed(1);
      const shareSlug =
        visibility === "public"
          ? faker.helpers.slugify(faker.lorem.words(3)).toLowerCase()
          : null;

      const pastDate = faker.date.anytime();
      const recentDate = faker.date.recent();

      // Insert submission
      const [submission] = await db
        .insert(roastSubmissions)
        .values({
          shareSlug: shareSlug || null,
          sourceCode,
          sourceLineCount,
          language,
          mode,
          status: "completed",
          visibility,
          score: score,
          verdict,
          headline: faker.lorem.sentence(),
          summary: faker.lorem.paragraph(),
          modelName: faker.helpers.arrayElement([
            "gpt-4",
            "claude-3",
            "gemini-pro",
          ]),
          createdAt: pastDate,
          updatedAt: recentDate,
          completedAt: recentDate,
        })
        .returning();

      if (!submission) {
        console.error(`❌ Failed to insert submission ${i + 1}`);
        continue;
      }

      // Insert analysis items
      const analysisItems = generateAnalysisItems(
        language,
        faker.number.int({ min: 2, max: 4 }),
      );
      if (analysisItems.length > 0) {
        await db.insert(roastAnalysisItems).values(
          analysisItems.map((item) => ({
            submissionId: submission.id,
            ...item,
            createdAt: new Date(),
          })),
        );
      }

      // Insert diff block
      const [diffBlockRecord] = await db
        .insert(roastDiffBlocks)
        .values({
          submissionId: submission.id,
          fromLabel: faker.system.fileName({ extensionCount: 1 }),
          toLabel: faker.system.fileName({ extensionCount: 1 }),
          createdAt: new Date(),
        })
        .returning();

      if (!diffBlockRecord) {
        console.error(`❌ Failed to insert diff block for submission ${i + 1}`);
        continue;
      }

      // Insert diff lines
      const diffLines = generateDiffLines();
      if (diffLines.length > 0) {
        await db.insert(roastDiffLines).values(
          diffLines.map((line) => ({
            diffBlockId: diffBlockRecord.id,
            ...line,
          })),
        );
      }

      // Progress indicator
      if ((i + 1) % 10 === 0) {
        console.log(`✓ Inserted ${i + 1}/${roastsToInsert} roasts`);
      }
    }

    console.log("✅ Seed completed successfully!");
    console.log(`📊 Total roasts inserted: ${roastsToInsert}`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during seed:", error);
    process.exit(1);
  }
}

seedDatabase();
