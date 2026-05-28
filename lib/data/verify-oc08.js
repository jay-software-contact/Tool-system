/**
 * Verification script — OC-08: Appwrite Client + Data Layer
 *
 * Validates that:
 * 1. lib/appwrite.js exports correctly (client, Client, Databases, ID, Query, DATABASE_ID)
 * 2. All lib/data/*.js files export the expected CRUD functions
 * 3. All files pass Node.js syntax check
 *
 * Run: node lib/data/verify-oc08.js
 */

import { readFileSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LIB_DIR = join(__dirname, '..');
const DATA_DIR = __dirname;

const files = [
  { path: join(LIB_DIR, 'appwrite.js'), name: 'appwrite.js' },
  { path: join(DATA_DIR, 'tools.js'), name: 'tools.js' },
  { path: join(DATA_DIR, 'components.js'), name: 'components.js' },
  { path: join(DATA_DIR, 'templates.js'), name: 'templates.js' },
  { path: join(DATA_DIR, 'taxonomy.js'), name: 'taxonomy.js' },
  { path: join(DATA_DIR, 'issues.js'), name: 'issues.js' },
  { path: join(DATA_DIR, 'pipelines.js'), name: 'pipelines.js' },
  { path: join(DATA_DIR, 'activity.js'), name: 'activity.js' },
  { path: join(DATA_DIR, 'search.js'), name: 'search.js' },
];

// ---------------------------------------------------------------------------
// 1. Syntax check all files
// ---------------------------------------------------------------------------
console.log('=== Syntax Check ===');
let syntaxOk = true;
for (const file of files) {
  try {
    execSync(`node --check "${file.path}"`, { stdio: 'pipe' });
    console.log(`  PASS  ${file.name}`);
  } catch (err) {
    console.log(`  FAIL  ${file.name}: ${err.stderr?.toString().trim()}`);
    syntaxOk = false;
  }
}

if (!syntaxOk) {
  console.error('\nSome files failed syntax check. Aborting.');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// 2. Verify exports via static analysis (grep for export statements)
// ---------------------------------------------------------------------------
console.log('\n=== Export Verification ===');

const expectedExports = {
  'appwrite.js': ['client', 'Client', 'Databases', 'ID', 'Query', 'DATABASE_ID'],
  'tools.js': ['listTools', 'getTool', 'createTool', 'updateTool', 'deleteTool'],
  'components.js': ['listComponents', 'getComponent', 'createComponent', 'updateComponent', 'deleteComponent'],
  'templates.js': ['listTemplates', 'getTemplate', 'createTemplate', 'updateTemplate', 'deleteTemplate'],
  'taxonomy.js': ['listTaxonomyEntries', 'getTaxonomyEntry', 'createTaxonomyEntry', 'updateTaxonomyEntry', 'deleteTaxonomyEntry'],
  'issues.js': ['listIssues', 'getIssue', 'createIssue', 'updateIssue', 'deleteIssue'],
  'pipelines.js': ['listPipelines', 'getPipeline', 'createPipeline', 'updatePipeline', 'deletePipeline'],
  'activity.js': ['listActivityEntries', 'getActivityEntry', 'createActivityEntry', 'updateActivityEntry', 'deleteActivityEntry'],
  'search.js': ['search'],
};

let exportsOk = true;
for (const [fileName, expected] of Object.entries(expectedExports)) {
  const filePath = fileName === 'appwrite.js'
    ? join(LIB_DIR, fileName)
    : join(DATA_DIR, fileName);
  const content = readFileSync(filePath, 'utf-8');

  for (const exp of expected) {
    const hasExport = content.includes(`export `) && (
      content.includes(`export async function ${exp}`) ||
      content.includes(`export function ${exp}`) ||
      content.includes(`export { ${exp}`) ||
      content.includes(`export {`) && content.includes(`${exp}`) ||
      content.includes(`export const ${exp}`)
    );
    if (hasExport) {
      console.log(`  PASS  ${fileName} → ${exp}`);
    } else {
      console.log(`  FAIL  ${fileName} → ${exp} (not found)`);
      exportsOk = false;
    }
  }
}

// ---------------------------------------------------------------------------
// 3. Summary
// ---------------------------------------------------------------------------
console.log('\n=== Summary ===');
if (syntaxOk && exportsOk) {
  console.log('All checks passed.');
  console.log(`  Files checked:    ${files.length}`);
  console.log(`  Data modules:     ${files.length - 1}`);
  console.log(`  All exports:      Verified`);
} else {
  console.error('Some checks failed.');
  process.exit(1);
}
