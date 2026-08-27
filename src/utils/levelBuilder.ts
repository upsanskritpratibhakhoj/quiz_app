import questionsRegistry from "../constants/questionsRegistry.json";

export interface Level {
  levelId: string;
  category: string;
  type: string;
  chunkIndex: number;
  questions: any[];
  title: string;
  desc: string;
  icon: string;
}

export const TYPE_ORDER = [
  "MCQ",
  "Multi_Select",
  "True_False",
  "Fill_Blank",
  "Sentence_Correction",
  "Match_Following",
  "Anvaya_Practice",
  "Sentence_Builder",
  "Word_Builder",
];

export const TYPE_META: Record<string, { title: string; desc: string; icon: string }> = {
  MCQ: {
    title: "बहुविकल्पीय अभ्यास (MCQ)",
    desc: "सही उत्तर का चयन करें।",
    icon: "❓",
  },
  Multi_Select: {
    title: "बहु-विकल्प चयन (Multi Select)",
    desc: "सभी सही उत्तरों को चुनें।",
    icon: "☑️",
  },
  True_False: {
    title: "सत्य या असत्य (True/False)",
    desc: "जांचें कि वाक्य सही है या गलत।",
    icon: "⚖️",
  },
  Fill_Blank: {
    title: "रिक्त स्थान (Fill Blank)",
    desc: "खाली स्थान में सही पद भरें।",
    icon: "✍️",
  },
  Sentence_Correction: {
    title: "वाक्य संशोधन (Correction)",
    desc: "अशुद्ध वाक्य में व्याकरण सुधारें।",
    icon: "🔧",
  },
  Match_Following: {
    title: "उचित मिलान (Match Following)",
    desc: "सही शब्दों का आपस में मिलान करें।",
    icon: "🤝",
  },
  Anvaya_Practice: {
    title: "अन्वय अभ्यास (Anvaya)",
    desc: "सही उत्तर या विकल्पों का चयन करें।",
    icon: "📖",
  },
  Sentence_Builder: {
    title: "वाक्य निर्माण (Sentence Builder)",
    desc: "शब्दों को उचित क्रम में लगाकर वाक्य बनाएं।",
    icon: "🧱",
  },
  Word_Builder: {
    title: "शब्द निर्माण (Word Builder)",
    desc: "अक्षरों को सही क्रम में लगाकर शब्द बनाएं।",
    icon: "🧩",
  },
};

/**
 * Split an array of questions into chunks of size 5-7 (targeting 5).
 */
export function chunkQuestions(questions: any[]): any[][] {
  const N = questions.length;
  if (N === 0) return [];
  if (N <= 7) return [questions];

  // Target 5 questions per chunk
  let numChunks = Math.round(N / 5);
  if (numChunks < 2) numChunks = 2;

  const chunks: any[][] = [];
  const baseSize = Math.floor(N / numChunks);
  let rem = N % numChunks;

  let index = 0;
  for (let i = 0; i < numChunks; i++) {
    const currentChunkSize = baseSize + (rem > 0 ? 1 : 0);
    if (rem > 0) rem--;

    chunks.push(questions.slice(index, index + currentChunkSize));
    index += currentChunkSize;
  }

  return chunks;
}

/**
 * Resolves question data for a given category name by handling suffix mismatches
 * (e.g. "वर्णमाला ज्ञान" -> "वर्णमाला", "शब्दकोश अभ्यास" -> "शब्दकोश") and merging keys if necessary.
 */
export function getCategoryData(classGroup: string, category: string): Record<string, any[]> {
  const groupData = (questionsRegistry as any)[classGroup] || {};

  if (groupData[category]) {
    return groupData[category];
  }

  // Normalize category name by stripping display suffixes like " ज्ञान", " अभ्यास", "-युक्त वाक्य", etc.
  const cleanName = category
    .trim()
    .replace(/\s+(ज्ञान|अभ्यास)$/, "")
    .replace(/-युक्त\s+वाक्य(\s+अभ्यास)?$/, "")
    .trim();

  if (groupData[cleanName]) {
    return groupData[cleanName];
  }

  // Merge matching keys (e.g., "वाक्य निर्माण-1", "वाक्य निर्माण-2" for "व्याकरण ज्ञान" or "वाक्य निर्माण")
  const merged: Record<string, any[]> = {};
  let found = false;

  Object.keys(groupData).forEach((key) => {
    const keyMatches =
      key === cleanName ||
      key.startsWith(cleanName) ||
      (cleanName === "व्याकरण" && key.startsWith("वाक्य निर्माण"));

    if (keyMatches) {
      found = true;
      const catObj = groupData[key];
      Object.keys(catObj).forEach((type) => {
        if (!merged[type]) {
          merged[type] = [];
        }
        merged[type].push(...catObj[type]);
      });
    }
  });

  return found ? merged : {};
}

/**
 * Build levels for a given category and path
 */
export function buildLevelsForCategory(category: string, pathSelection: string): Level[] {
  const classGroup = pathSelection === "beginner" ? "बाल वर्ग" : "युवा वर्ग";
  const categoryData = getCategoryData(classGroup, category);

  const levels: Level[] = [];

  // Sort and process question types by our specified order
  for (const type of TYPE_ORDER) {
    const rawQuestions = categoryData[type];
    if (!rawQuestions || !Array.isArray(rawQuestions) || rawQuestions.length === 0) {
      continue;
    }

    const chunks = chunkQuestions(rawQuestions);
    const meta = TYPE_META[type] || {
      title: type.replace("_", " "),
      desc: "अभ्यास करें",
      icon: "📝",
    };

    chunks.forEach((chunk, chunkIdx) => {
      // Unique level ID: category_type_chunkIdx
      const categoryId = category.replace(/\s+/g, "_");
      const levelId = `${categoryId}_${type}_${chunkIdx}`;
      
      levels.push({
        levelId,
        category,
        type,
        chunkIndex: chunkIdx,
        questions: chunk,
        title: chunks.length > 1 ? `${meta.title} - भाग ${chunkIdx + 1}` : meta.title,
        desc: meta.desc,
        icon: meta.icon,
      });
    });
  }

  return levels;
}
