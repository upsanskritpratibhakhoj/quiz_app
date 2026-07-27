const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, '../output');
const targetFile = path.join(__dirname, '../src/constants/questionsRegistry.json');

const registry = {};

function scanDirectory(dir) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanDirectory(fullPath);
    } else if (item === 'questions.json') {
      const relative = path.relative(outputDir, fullPath);
      const parts = relative.split(path.sep);
      if (parts.length >= 4) {
        const classGroup = parts[0];
        const category = parts[1];
        const questionType = parts[2];

        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          const questions = JSON.parse(content);

          if (!registry[classGroup]) registry[classGroup] = {};
          if (!registry[classGroup][category]) registry[classGroup][category] = {};
          registry[classGroup][category][questionType] = questions;
        } catch (e) {
          console.error(`Error reading ${fullPath}:`, e);
        }
      }
    }
  }
}

console.log('Scanning output directory for questions...');
scanDirectory(outputDir);
console.log(`Writing questions registry to ${targetFile}...`);
fs.writeFileSync(targetFile, JSON.stringify(registry, null, 2), 'utf8');
console.log('Success!');
