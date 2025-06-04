
export interface WidgetSettings {
  userId: string;
  apiKeyId?: string; // Add apiKeyId to the WidgetSettings
  title: string;
  backgroundColor: string;
  textColor: string;
  primaryColor: string;
  showLogo: boolean;
  logoUrl?: string;
  feedbackType: 'text' | 'rating' | 'both';
  ratingType?: 'stars' | 'emoji';
  ratingScale?: number;
  showPrompt?: boolean;
  customPrompt?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  showRating?: boolean;
  buttonStyle?: string;
  buttonText?: string;
  buttonIcon?: string;
}

export interface Feedback {
  id: string;
  userId: string;
  apiKey: string;
  apiKeyName?: string;
  apiKeyId?: string;
  text: string;
  rating?: number;
  sentiment?: SentimentType;
  createdAt: string;
  analyzed?: boolean;
  source?: string;
}

export type SentimentType = 'positive' | 'negative' | 'neutral' | undefined;

export interface ApiKey {
  id: string;
  apiKey: string;
  name: string;
  userId: string;
  createdAt: string;
}
