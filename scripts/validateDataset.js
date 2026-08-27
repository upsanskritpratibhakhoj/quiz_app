/**
 * Dataset Validator for Sanskrit Quiz App
 * Validates the schema, question types, answer formats, and category mappings.
 * Exits with code 1 if any rule is violated.
 */

const fs = require('fs');
const path = require('path');

const VALID_CLASS_GROUPS = ['बाल वर्ग', 'युवा वर्ग'];
const VALID_QUESTION_TYPES = [
  'MCQ',
  'Multi_Select',
  'True_False',
  'Fill_Blank',
  'Sentence_Correction',
  'Match_Following',
  'Anvaya_Practice',
  'Sentence_Builder',
  'Word_Builder',
];

const outputDir = path.join(__dirname, '../output');
const catFile = path.join(__dirname, '../src/constants/quizCategories.ts');

const errors = [];
const warnings = [];
let totalFilesChecked = 0;
let totalQuestionsChecked = 0;

// Load categories from quizCategories.ts
function loadCategories() {
  if (!fs.existsSync(catFile)) {
    warnings.push(`quizCategories.ts not found at ${catFile}`);
    return { bal: [], yuva: [] };
  }
  const content = fs.readFileSync(catFile, 'utf8');
  const balMatch = content.match(/BAL_VARG_CATEGORIES\s*=\s*\[([\s\S]*?)\];/);
  const yuvaMatch = content.match(/YUVA_VARG_CATEGORIES\s*=\s*\[([\s\S]*?)\];/);

  const clean = (m) =>
    m
      ? m[1]
          .split('\n')
          .map((s) => s.trim().replace(/^["']|["',]$/g, ''))
          .filter(Boolean)
      : [];

  return {
    bal: clean(balMatch),
    yuva: clean(yuvaMatch),
  };
}

const registeredCategories = loadCategories();

function validateQuestion(q, qIdx, filePath, questionType) {
  const loc = `${filePath} [Index ${qIdx}]`;

  // 1. Basic Type & Presence
  if (typeof q !== 'object' || q === null) {
    errors.push(`${loc}: Question entry must be a valid JSON object.`);
    return;
  }

  // 2. Question text
  if (!q.Question || typeof q.Question !== 'string' || q.Question.trim() === '') {
    errors.push(`${loc}: Missing or empty "Question" string.`);
  }

  // 3. Correct_Answer
  if (!q.Correct_Answer || typeof q.Correct_Answer !== 'string' || q.Correct_Answer.trim() === '') {
    errors.push(`${loc}: Missing or empty "Correct_Answer" string.`);
  }

  // 4. Option_A
  if (!q.Option_A || typeof q.Option_A !== 'string' || q.Option_A.trim() === '') {
    errors.push(`${loc}: Missing or empty "Option_A" string.`);
  }

  const rawAns = (q.Correct_Answer || '').trim();

  // 5. Type-Specific Validation
  switch (questionType) {
    case 'MCQ':
    case 'Sentence_Correction':
    case 'Fill_Blank': {
      if (!q.Option_B || typeof q.Option_B !== 'string' || q.Option_B.trim() === '') {
        errors.push(`${loc}: ${questionType} must have at least "Option_A" and "Option_B".`);
      }
      const validOptions = ['Option_A', 'Option_B', 'Option_C', 'Option_D'];
      const optionTexts = [q.Option_A, q.Option_B, q.Option_C, q.Option_D].filter(Boolean).map((o) => o.trim());

      const matchesKey = validOptions.includes(rawAns);
      const matchesText = optionTexts.includes(rawAns);

      if (!matchesKey && !matchesText) {
        errors.push(
          `${loc}: Invalid Correct_Answer "${rawAns}". Must be one of ${validOptions.join(', ')} or match one of the option texts.`
        );
      }
      break;
    }

    case 'True_False': {
      if (!q.Option_B || typeof q.Option_B !== 'string' || q.Option_B.trim() === '') {
        errors.push(`${loc}: True_False must have "Option_A" and "Option_B".`);
      }
      const validTFKeys = ['Option_A', 'Option_B', 'सत्यम्', 'असत्यम्', 'सत्य', 'असत्य'];
      if (!validTFKeys.includes(rawAns) && rawAns !== q.Option_A?.trim() && rawAns !== q.Option_B?.trim()) {
        errors.push(`${loc}: Invalid Correct_Answer "${rawAns}" for True_False question.`);
      }
      break;
    }

    case 'Multi_Select': {
      const isGrid = q.Option_A && q.Option_A.includes(',') && !q.Option_B;
      if (isGrid) {
        const gridItems = q.Option_A.split(',').map((s) => s.trim()).filter(Boolean);
        if (gridItems.length < 2) {
          errors.push(`${loc}: Grid Multi_Select Option_A must contain at least 2 comma-separated items.`);
        }
        const answers = rawAns.split(',').map((s) => s.trim()).filter(Boolean);
        if (answers.length === 0) {
          errors.push(`${loc}: Multi_Select must have at least one correct answer.`);
        }
      } else {
        const answers = rawAns.split(/[,;]/).map((s) => s.trim()).filter(Boolean);
        if (answers.length === 0) {
          errors.push(`${loc}: Multi_Select must have at least one correct answer.`);
        }
      }
      break;
    }

    case 'Anvaya_Practice': {
      if (!q.Option_A || typeof q.Option_A !== 'string' || q.Option_A.trim() === '') {
        errors.push(`${loc}: Anvaya_Practice must have a valid non-empty "Option_A".`);
        break;
      }

      // Check whether this question uses Format 1 (Option_X style) or Format 2 (Word Bank / List style)
      const isWordListFormat =
        (q.Option_A.includes(',') || !q.Option_B) &&
        (rawAns.includes(';') || (rawAns.includes(',') && !['Option_A', 'Option_B', 'Option_C', 'Option_D'].includes(rawAns)) || !/^Option_[A-D]$/.test(rawAns));

      if (isWordListFormat) {
        // Format 2: Word Bank / List of words format
        const wordBank = q.Option_A.split(',').map((s) => s.trim()).filter(Boolean);
        if (wordBank.length < 2) {
          errors.push(`${loc}: Anvaya_Practice (Word Bank format) Option_A must contain at least 2 comma-separated words.`);
        }

        const correctWords = rawAns
          .split(/[,;]/)
          .map((s) => s.trim())
          .filter(Boolean);

        if (correctWords.length === 0) {
          errors.push(`${loc}: Anvaya_Practice (Word Bank format) Correct_Answer must contain at least 1 correct word.`);
        }

        // Verify all words in Correct_Answer exist in the Option_A word bank
        correctWords.forEach((word) => {
          if (!wordBank.includes(word)) {
            warnings.push(
              `${loc}: Word "${word}" in Correct_Answer not found verbatim in Option_A word bank [${wordBank.join(', ')}].`
            );
          }
        });
      } else {
        // Format 1: Option_A/B/C/D choice format
        if (!q.Option_B || typeof q.Option_B !== 'string' || q.Option_B.trim() === '') {
          errors.push(`${loc}: Anvaya_Practice (Option format) must have at least "Option_A" and "Option_B".`);
        }
        const validOptions = ['Option_A', 'Option_B', 'Option_C', 'Option_D'];
        const optionTexts = [q.Option_A, q.Option_B, q.Option_C, q.Option_D].filter(Boolean).map((o) => o.trim());

        const matchesKey = validOptions.includes(rawAns);
        const matchesText = optionTexts.includes(rawAns);

        if (!matchesKey && !matchesText) {
          errors.push(
            `${loc}: Invalid Correct_Answer "${rawAns}" for Anvaya_Practice (Option format). Must be one of ${validOptions.join(', ')} or match one of the option texts.`
          );
        }
      }
      break;
    }

    case 'Sentence_Builder': {
      const words = (q.Option_A || '').split(',').map((s) => s.trim()).filter(Boolean);
      if (words.length < 2) {
        errors.push(`${loc}: Sentence_Builder Option_A must contain at least 2 comma-separated words.`);
      }
      if (!rawAns) {
        errors.push(`${loc}: Sentence_Builder must have a valid non-empty Correct_Answer sentence.`);
      }
      break;
    }

    case 'Word_Builder': {
      const letters = (q.Option_A || '').split(',').map((s) => s.trim()).filter(Boolean);
      if (letters.length < 2) {
        errors.push(`${loc}: Word_Builder Option_A must contain at least 2 comma-separated letters/aksharas.`);
      }
      if (!rawAns) {
        errors.push(`${loc}: Word_Builder must have a valid non-empty Correct_Answer word.`);
      }
      break;
    }

    case 'Match_Following': {
      if (!q.Option_B) {
        errors.push(`${loc}: Match_Following must have both Option_A (left column) and Option_B (right column).`);
        break;
      }
      const leftItems = (q.Option_A || '').split(',').map((s) => s.trim()).filter(Boolean);
      const rightItems = (q.Option_B || '').split(',').map((s) => s.trim()).filter(Boolean);

      if (leftItems.length < 2 || rightItems.length < 2) {
        errors.push(`${loc}: Match_Following columns must each have at least 2 items.`);
      }

      const pairs = rawAns.split(',').map((p) => p.trim()).filter(Boolean);
      if (pairs.length === 0) {
        errors.push(`${loc}: Match_Following Correct_Answer must contain comma-separated pairs.`);
      }

      pairs.forEach((pair) => {
        const trimmed = pair.trim();
        const matchingLeft = leftItems.find((l) => trimmed.startsWith(l));
        let left = '';
        let right = '';
        if (matchingLeft) {
          left = matchingLeft;
          right = trimmed.slice(matchingLeft.length).replace(/^[\s\-:=]+/, '').trim();
        } else {
          const hyphenIdx = trimmed.indexOf('-');
          left = hyphenIdx !== -1 ? trimmed.substring(0, hyphenIdx).trim() : '';
          right = hyphenIdx !== -1 ? trimmed.substring(hyphenIdx + 1).trim() : '';
        }

        if (!left || !right) {
          errors.push(`${loc}: Invalid pair format in Correct_Answer: "${pair}". Expected format "LeftItem - RightItem".`);
        }
      });
      break;
    }

    default:
      errors.push(`${loc}: Unknown question type "${questionType}".`);
  }
}

function scanAndValidate(dir) {
  if (!fs.existsSync(dir)) {
    errors.push(`Output directory not found at: ${dir}`);
    return;
  }

  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      scanAndValidate(fullPath);
    } else if (item === 'questions.json') {
      totalFilesChecked++;
      const relative = path.relative(outputDir, fullPath);
      const parts = relative.split(path.sep);

      if (parts.length < 3) {
        errors.push(`Invalid directory nesting for: ${relative}. Expected <ClassGroup>/<Category>/<QuestionType>/questions.json`);
        continue;
      }

      const classGroup = parts[0];
      const category = parts[1];
      const questionType = parts[2];

      // Validate Class Group
      if (!VALID_CLASS_GROUPS.includes(classGroup)) {
        errors.push(`Invalid class group folder "${classGroup}" in ${relative}. Must be one of: ${VALID_CLASS_GROUPS.join(', ')}`);
      }

      // Validate Question Type
      if (!VALID_QUESTION_TYPES.includes(questionType)) {
        errors.push(`Invalid question type folder "${questionType}" in ${relative}. Must be one of: ${VALID_QUESTION_TYPES.join(', ')}`);
      }

      // Validate JSON content
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const questions = JSON.parse(content);

        if (!Array.isArray(questions)) {
          errors.push(`${relative}: File content must be a JSON Array of questions.`);
          continue;
        }

        if (questions.length === 0) {
          warnings.push(`${relative}: Contains an empty questions array (0 questions).`);
        }

        questions.forEach((q, idx) => {
          totalQuestionsChecked++;
          validateQuestion(q, idx, relative, questionType);
        });
      } catch (e) {
        errors.push(`${relative}: Failed to parse JSON - ${e.message}`);
      }
    }
  }
}

console.log('🔍 Starting Sanskrit Quiz Dataset Validation...\n');
scanAndValidate(outputDir);

console.log('====================================================');
console.log(`📊 Validation Summary:`);
console.log(`   - Total Files Inspected: ${totalFilesChecked}`);
console.log(`   - Total Questions Inspected: ${totalQuestionsChecked}`);
console.log(`   - Total Warnings: ${warnings.length}`);
console.log(`   - Total Errors: ${errors.length}`);
console.log('====================================================\n');

if (warnings.length > 0) {
  console.log('⚠️  WARNINGS:');
  warnings.forEach((w) => console.log(`   - ${w}`));
  console.log('');
}

if (errors.length > 0) {
  console.log('❌ VALIDATION FAILED! Found the following errors:\n');
  errors.forEach((err, i) => console.log(`   ${i + 1}. ${err}`));
  console.log('\n❌ Please fix the above errors before updating or deploying the question bank.\n');
  process.exit(1);
} else {
  console.log('✅ ALL CHECKS PASSED! Dataset strictly conforms to schema and quiz engine rules.\n');
  process.exit(0);
}
