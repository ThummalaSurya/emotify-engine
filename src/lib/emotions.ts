export type EmotionKey = "joy" | "sadness" | "anger" | "fear" | "surprise" | "love" | "neutral";

export const EMOTIONS: Record<EmotionKey, { label: string; emoji: string; color: string }> = {
  joy: { label: "Joy", emoji: "😄", color: "hsl(var(--joy))" },
  sadness: { label: "Sadness", emoji: "😢", color: "hsl(var(--sadness))" },
  anger: { label: "Anger", emoji: "😡", color: "hsl(var(--anger))" },
  fear: { label: "Fear", emoji: "😨", color: "hsl(var(--fear))" },
  surprise: { label: "Surprise", emoji: "😲", color: "hsl(var(--surprise))" },
  love: { label: "Love", emoji: "🥰", color: "hsl(var(--love))" },
  neutral: { label: "Neutral", emoji: "😐", color: "hsl(var(--neutral))" },
};

export const EMOTION_ORDER: EmotionKey[] = ["joy", "love", "surprise", "neutral", "sadness", "fear", "anger"];

export interface EmotionResult {
  dominant: EmotionKey;
  insight: string;
  emotions: Record<EmotionKey, number>;
}
