export enum Tone {
  PROFESSIONAL = 'Professional',
  WITTY = 'Witty',
  URGENT = 'Urgent',
  INSPIRATIONAL = 'Inspirational',
  CASUAL = 'Casual'
}

export enum ImageResolution {
  R_1K = '1K',
  R_2K = '2K',
  R_4K = '4K'
}

export type AspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9';

export interface GeneratedPost {
  platform: 'LinkedIn' | 'Twitter' | 'Instagram';
  content: string;
  imagePrompt: string;
  imageData?: string; // Base64 string
  isLoadingImage: boolean;
  aspectRatio: AspectRatio;
}

export interface GenerationResult {
  linkedin: GeneratedPost;
  twitter: GeneratedPost;
  instagram: GeneratedPost;
}

export interface ContentRequest {
  topic: string;
  tone: Tone;
  resolution: ImageResolution;
}