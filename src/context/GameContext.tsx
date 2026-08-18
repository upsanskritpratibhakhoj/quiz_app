import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface GameContextType {
  hearts: number;
  exp: number;
  coins: number; // Aliased to exp for backwards compatibility
  isLoading: boolean;
  completedLevels: Record<string, { completed: boolean; score: number }>;
  loseHeart: () => Promise<boolean>;
  addHearts: (amount: number) => Promise<void>;
  addExp: (amount: number) => Promise<void>;
  deductExp: (amount: number) => Promise<void>;
  buyHeartWithExp: () => Promise<{ success: boolean; message: string }>;
  refillHeartsWithExp: () => Promise<{ success: boolean; message: string }>;
  // Compatibility aliases
  addCoins: (amount: number) => Promise<void>;
  deductCoins: (amount: number) => Promise<boolean>;
  buyHeartWithCoins: () => Promise<{ success: boolean; message: string }>;
  refillHeartsWithCoins: () => Promise<{ success: boolean; message: string }>;
  completeLevel: (levelId: string, score: number) => Promise<void>;
  resetStats: () => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const HEARTS_KEY = "@quiz-app:hearts";
const EXP_KEY = "@quiz-app:exp";
const COMPLETED_LEVELS_KEY = "@quiz-app:completed_levels";

const MAX_HEARTS = 5;
const SINGLE_HEART_COST = 20; // 20 EXP
const FULL_REFILL_COST = 100; // 100 EXP

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hearts, setHeartsState] = useState<number>(MAX_HEARTS);
  const [exp, setExpState] = useState<number>(0);
  const [completedLevels, setCompletedLevelsState] = useState<Record<string, { completed: boolean; score: number }>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load stats from AsyncStorage on mount
  useEffect(() => {
    const loadStats = async () => {
      try {
        const storedHearts = await AsyncStorage.getItem(HEARTS_KEY);
        const storedExp = await AsyncStorage.getItem(EXP_KEY);
        const storedCompleted = await AsyncStorage.getItem(COMPLETED_LEVELS_KEY);

        if (storedHearts !== null) setHeartsState(parseInt(storedHearts, 10));
        if (storedExp !== null) setExpState(parseInt(storedExp, 10));
        if (storedCompleted !== null) setCompletedLevelsState(JSON.parse(storedCompleted));
      } catch (error) {
        console.error("Error loading game stats from AsyncStorage:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadStats();
  }, []);

  // Helpers to save to storage
  const saveHearts = async (val: number) => {
    try {
      await AsyncStorage.setItem(HEARTS_KEY, val.toString());
    } catch (e) {
      console.error(e);
    }
  };

  const saveExp = async (val: number) => {
    try {
      await AsyncStorage.setItem(EXP_KEY, val.toString());
    } catch (e) {
      console.error(e);
    }
  };

  const loseHeart = async (): Promise<boolean> => {
    const nextHearts = Math.max(0, hearts - 1);
    setHeartsState(nextHearts);
    await saveHearts(nextHearts);
    return nextHearts > 0;
  };

  const addHearts = async (amount: number) => {
    const nextHearts = Math.min(MAX_HEARTS, hearts + amount);
    setHeartsState(nextHearts);
    await saveHearts(nextHearts);
  };

  const addExp = async (amount: number) => {
    const nextExp = exp + amount;
    setExpState(nextExp);
    await saveExp(nextExp);
  };

  const deductExp = async (amount: number) => {
    const nextExp = exp - amount; // Score is allowed to become negative!
    setExpState(nextExp);
    await saveExp(nextExp);
  };

  const buyHeartWithExp = async (): Promise<{ success: boolean; message: string }> => {
    if (hearts >= MAX_HEARTS) {
      return { success: false, message: "आपके पास पहले से ही पूरे दिल (Hearts) हैं!" };
    }
    // Spend EXP (can go negative)
    await deductExp(SINGLE_HEART_COST);
    await addHearts(1);
    return { success: true, message: "1 दिल (Heart) सफलतापूर्वक खरीदा गया! ❤️" };
  };

  const refillHeartsWithExp = async (): Promise<{ success: boolean; message: string }> => {
    if (hearts >= MAX_HEARTS) {
      return { success: false, message: "आपके पास पहले से ही पूरे दिल (Hearts) हैं!" };
    }
    // Spend EXP (can go negative)
    await deductExp(FULL_REFILL_COST);
    await addHearts(MAX_HEARTS);
    return { success: true, message: "सभी दिल (Hearts) रीफिल हो गए हैं! ❤️" };
  };

  const completeLevel = async (levelId: string, score: number) => {
    const isCompleted = score >= 75;
    const existing = completedLevels[levelId];
    
    // Only update if not already completed, or if new score is higher
    if (!existing || !existing.completed || score > existing.score) {
      const nextProgress = {
        ...completedLevels,
        [levelId]: { 
          completed: isCompleted || (existing?.completed ?? false), 
          score: Math.max(score, existing?.score ?? 0) 
        },
      };
      setCompletedLevelsState(nextProgress);
      try {
        await AsyncStorage.setItem(COMPLETED_LEVELS_KEY, JSON.stringify(nextProgress));
      } catch (e) {
        console.error("Error saving completed levels:", e);
      }
    }
  };

  const resetStats = async () => {
    setHeartsState(MAX_HEARTS);
    setExpState(0);
    setCompletedLevelsState({});
    await Promise.all([
      AsyncStorage.setItem(HEARTS_KEY, MAX_HEARTS.toString()),
      AsyncStorage.setItem(EXP_KEY, "0"),
      AsyncStorage.setItem(COMPLETED_LEVELS_KEY, JSON.stringify({})),
    ]);
  };

  return (
    <GameContext.Provider
      value={{
        hearts,
        exp,
        coins: exp, // Alias for backwards compatibility
        isLoading,
        completedLevels,
        loseHeart,
        addHearts,
        addExp,
        deductExp,
        buyHeartWithExp,
        refillHeartsWithExp,
        // Aliases
        addCoins: addExp,
        deductCoins: async (amount: number) => {
          await deductExp(amount);
          return true;
        },
        buyHeartWithCoins: buyHeartWithExp,
        refillHeartsWithCoins: refillHeartsWithExp,
        completeLevel,
        resetStats,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};

