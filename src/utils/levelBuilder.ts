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
  "Word_Connect",
  "Vocabulary_Breakdown"
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
  Word_Connect: {
    title: "शब्द संधान (Word Connect)",
    desc: "सही अर्थों/शब्दों का संयोग करें।",
    icon: "🔗",
  },
  Vocabulary_Breakdown: {
    title: "शब्दावली विश्लेषण (Vocabulary)",
    desc: "शब्दों के विच्छेद और अर्थ को समझें।",
    icon: "🧐",
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
 * Build levels for a given category and path
 */
export function buildLevelsForCategory(category: string, pathSelection: string): Level[] {
  const classGroup = pathSelection === "beginner" ? "बाल वर्ग" : "युवा वर्ग";
  const categoryData = (questionsRegistry as any)[classGroup]?.[category] || {};

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
