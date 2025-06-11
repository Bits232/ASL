export interface Translation {
  id: string;
  text: string;
  timestamp: Date;
  confidence: number;
}

export interface Suggestion {
  id: string;
  text: string;
  category: 'greeting' | 'question' | 'common' | 'emergency';
}

export type TranslationMode = 'sign-to-text' | 'text-to-sign';

export interface HandDetection {
  isDetected: boolean;
  confidence: number;
  landmarks?: any[];
}