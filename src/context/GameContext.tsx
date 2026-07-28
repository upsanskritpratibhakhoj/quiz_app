import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface GameContextType {
  hearts: number;
  coins: number;
  exp: number;
  isLoading: boolean;
  completedLevels: Record<string, { completed: boolean; score: number }>;
  loseHeart: () => Promise<boolean>;
  addHearts: (amount: number) => Promise<void>;
  addCoins: (amount: number) => Promise<void>;
  deductCoins: (amount: number) => Promise<boolean>;
  addExp: (amount: number) => Promise<void>;
  buyHeartWithCoins: () => Promise<{ success: boolean; message: string }>;
  refillHeartsWithCoins: () => Promise<{ success: boolean; message: string }>;
  completeLevel: (levelId: string, score: number) => Promise<void>;
  resetStats: () => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const HEARTS_KEY = "@quiz-app:hearts";
const COINS_KEY = "@quiz-app:coins";
const EXP_KEY = "@quiz-app:exp";
const COMPLETED_LEVELS_KEY = "@quiz-app:completed_levels";

const MAX_HEARTS = 5;
const SINGLE_HEART_COST = 20;
const FULL_REFILL_COST = 100;

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hearts, setHeartsState] = useState<number>(MAX_HEARTS);
  const [coins, setCoinsState] = useState<number>(100); // Start with 100 for testing
  const [exp, setExpState] = useState<number>(0);
  const [completedLevels, setCompletedLevelsState] = useState<Record<string, { completed: boolean; score: number }>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load stats from AsyncStorage on mount
  useEffect(() => {
    const loadStats = async () => {
      try {
        const storedHearts = await AsyncStorage.getItem(HEARTS_KEY);
        const storedCoins = await AsyncStorage.getItem(COINS_KEY);
        const storedExp = await AsyncStorage.getItem(EXP_KEY);
        const storedCompleted = await AsyncStorage.getItem(COMPLETED_LEVELS_KEY);

        if (storedHearts !== null) setHeartsState(parseInt(storedHearts, 10));
        if (storedCoins !== null) setCoinsState(parseInt(storedCoins, 10));
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

  const saveCoins = async (val: number) => {
    try {
      await AsyncStorage.setItem(COINS_KEY, val.toString());
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

  const addCoins = async (amount: number) => {
    const nextCoins = coins + amount;
    setCoinsState(nextCoins);
    await saveCoins(nextCoins);
  };

  const deductCoins = async (amount: number): Promise<boolean> => {
    if (coins < amount) return false;
    const nextCoins = coins - amount;
    setCoinsState(nextCoins);
    await saveCoins(nextCoins);
    return true;
  };

  const addExp = async (amount: number) => {
    const nextExp = exp + amount;
    setExpState(nextExp);
    await saveExp(nextExp);
  };

  const buyHeartWithCoins = async (): Promise<{ success: boolean; message: string }> => {
    if (hearts >= MAX_HEARTS) {
      return { success: false, message: "आपके पास पहले से ही पूरे दिल (Hearts) हैं!" };
    }
    if (coins < SINGLE_HEART_COST) {
      return { success: false, message: "सिक्के पर्याप्त नहीं हैं! (Need 20 coins)" };
    }
    const success = await deductCoins(SINGLE_HEART_COST);
    if (success) {
      await addHearts(1);
      return { success: true, message: "1 दिल (Heart) सफलतापूर्वक खरीदा गया! ❤️" };
    }
    return { success: false, message: "खरीदने में त्रुटि हुई।" };
  };

  const refillHeartsWithCoins = async (): Promise<{ success: boolean; message: string }> => {
    if (hearts >= MAX_HEARTS) {
      return { success: false, message: "आपके पास पहले से ही पूरे दिल (Hearts) हैं!" };
    }
    if (coins < FULL_REFILL_COST) {
      return { success: false, message: "सिक्के पर्याप्त नहीं हैं! (Need 100 coins)" };
    }
    const success = await deductCoins(FULL_REFILL_COST);
    if (success) {
      await addHearts(MAX_HEARTS);
      return { success: true, message: "सभी दिल (Hearts) रीफिल हो गए हैं! ❤️" };
    }
    return { success: false, message: "खरीदने में त्रुटि हुई।" };
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
    setCoinsState(100);
    setExpState(0);
    setCompletedLevelsState({});
    await Promise.all([
      AsyncStorage.setItem(HEARTS_KEY, MAX_HEARTS.toString()),
      AsyncStorage.setItem(COINS_KEY, "100"),
      AsyncStorage.setItem(EXP_KEY, "0"),
      AsyncStorage.setItem(COMPLETED_LEVELS_KEY, JSON.stringify({})),
    ]);
  };

  return (
    <GameContext.Provider
      value={{
        hearts,
        coins,
        exp,
        isLoading,
        completedLevels,
        loseHeart,
        addHearts,
        addCoins,
        deductCoins,
        addExp,
        buyHeartWithCoins,
        refillHeartsWithCoins,
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
